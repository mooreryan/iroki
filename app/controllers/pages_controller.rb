class PagesController < ApplicationController
  def home
    @color_map_title = "Color the tree with an explicit color map file."
  end

  def submit
    @newick           = params[:newick_file]
    @color_map        = params[:color_map]
    @name_map         = params[:name_map]
    @biom_file        = params[:biom_file]
    @color_branches   = params[:color_branches]
    @color_labels     = params[:color_labels]
    @exact            = params[:exact]
    @remove_below     = params[:remove_below]
    @single_color     = params[:single_color]
    @auto_color       = params[:auto_color]

    if @newick
      basein = File.basename(@newick.original_filename,
                             File.extname(@newick.original_filename))
    else
      basein = "apple"
    end


    newick_str, color_map_str, name_map_str, biom_file_str = nil

    if @newick
      newick_path = @newick.tempfile.path
      newick_str = File.read(newick_path)
    end

    if @color_map
      color_map_path = @color_map.tempfile.path
      color_map_str = File.read color_map_path
    end

    if @name_map
      name_map_path  = @name_map.tempfile.path
      name_map_str   = File.read name_map_path
    end

    if @biom_file
      biom_file_path = @biom_file.tempfile.path
      biom_file_str = File.read biom_file_path
    end


    # outf =
    #     Tempfile.new ["#{basein}.", ".nex"]

    # begin
    # flash.now[:notice] = "Processing #{newick_path}"

    # Iroki::Main::main(color_branches: @color_branches,
    #                   color_taxa_names: @color_labels,
    #                   exact: @exact,
    #                   remove_bootstraps_below: @remove_below.to_f,
    #                   color_map_f: color_map_path,
    #                   biom_f: biom_file_path,
    #                   single_color: @single_color,
    #                   name_map_f: name_map_path,
    #                   auto_color: @auto_color,
    #                   display_auto_color_options: nil,
    #                   newick_f: newick_path,
    #                   out_f: outf.path)


    # Make a rec in IrokiInput
    timestr = Time.now.strftime("%Y%m%d%H%M%S%L")
    randstr = 10.times.map { ('a'..'z').to_a.sample }.join
    upload_id = %W[timestr randstr].join # use this to query the db


    iroki_input = IrokiInput.new upload_id: upload_id,
                                 newick_str: newick_str,
                                 color_map_str: color_map_str,
                                 name_map_str: name_map_str,
                                 biom_str: biom_file_str

    iroki_input.save!

    @job = IrokiJob.perform_later(color_branches: @color_branches,
                                  color_taxa_names: @color_labels,
                                  exact: @exact,
                                  remove_bootstraps_below: @remove_below.to_f,
                                  color_map_f: color_map_path,
                                  biom_f: biom_file_path,
                                  single_color: @single_color,
                                  name_map_f: name_map_path,
                                  auto_color: @auto_color,
                                  display_auto_color_options: nil,
                                  newick_f: newick_path,
                                  fname: @newick.original_filename,
                                  upload_id: upload_id,
                                  iroki_input: iroki_input)

    @jawn = 2342
    @job_finished = "No"
    @job_id = @job.job_id
    @jobs_in_queue = Delayed::Job.all.count
    @dj_row_id = @job.provider_job_id


    # send_file outf.path, type: "text"
    # redirect_to jobs_path
    render :jobs
    # rescue AbortIf::Exit => e
    #   @apple ||= e.message
    #   render :error
  end

  def about
  end

  def contact
  end

  def error
  end

  def citation
  end

  def jobs
    p params
    @jawn = 2342
    @jobs_in_queue = Delayed::Job.all.count

    @job_id = params[:job_id]
    @dj_row_id = params[:dj_row_id]

    dj_rec = Delayed::Job.where(id: @dj_row_id)
    p 1, dj_rec.inspect

    if dj_rec.empty? # it is def done
      # TODO assert exactly one
      iroki_output = IrokiOutput.where(dj_id: @job_id).first

      if iroki_output.nil?
        p "HELLO"
        @stale_download_link = "Can't find you job (id: #{@job_id}) please submit again. Sorry!"
        render :error
      else
        p :ryan, iroki_output.inspect


        @job_finished = "Yes"
        @iroki_result = iroki_output.send_result
        # IrokiOutput.destroy iroki_output.id

        # TODO render error on error, not send it as a file
        if iroki_output.error # there was an AbortIf error
          @error_message = iroki_output.error
          render :error
        else
          time = Time.now.strftime("%Y-%m-%d_%H-%M-%S.%L")
          file = Tempfile.new %W[#{time}. .nexus.txt]
          begin
            file.write @iroki_result
            file.close
            @file_path = file.path

              # send_file file.path, type: "text"
          ensure
            file.close
            # file.unlink   # deletes the temp file
          end
        end
      end

    else
      @job_finished = "No"
    end
  end

  def download_result
    # TODO ensure this is deleted afterwards?
    iroki_output = IrokiOutput.where(dj_id: params[:job_id]).first
    p :thing, iroki_output.inspect

    if iroki_output
      begin
          send_data iroki_output.nexus, filename: "#{iroki_output.filename}.#{iroki_output.created_at.strftime("%Y-%m-%d_%H-%M-%S.%L")}.nexus.txt"
      ensure
        IrokiOutput.destroy(iroki_output.id) if iroki_output
      end
    else
      @stale_download_link = "You clicked on a stale download link."
      render :error
    end
  end

  def num_jobs_in_queue
    @jobs_in_queue = Delayed::Job.all.count
  end
end
