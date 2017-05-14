class PagesController < ApplicationController
  def home
    @color_map_title = "Color the tree with an explicit color map file."
  end

  def submit
    p [:JAWN, params[:single_color]]
    @newick           = params[:newick_file]
    @color_map        = params[:color_map]
    @name_map         = params[:name_map]
    @biom_file        = params[:biom_file]
    @color_branches   = params[:color_branches]
    @color_labels     = params[:color_labels]
    @exact            = params[:exact]
    @remove_below     = params[:remove_below]
    @auto_color       = params[:auto_color]
    @min_lumin        = params[:min_lumin]
    @max_lumin        = params[:max_lumin]

    case params[:single_color]
      when "true"
        @single_color = true
      when "false"
        @single_color = false
      else
        @single_color = nil
    end

    unless @newick
      @error_message = "Missing the Newick file."
      render(:error) and return
    end

    if @newick && !@color_map && !@name_map && !@biom_file
      @error_message = "Need at least one of color map, name map, or biom file."
      render(:error) and return
    end

    # unless @color_map
    #   @error_message = "Missing the color map file."
    #   render(:error) and return
    # end

    # unless @newick
    #   @error_message = "Missing the Newick file."
    #   render(:error) and return
    # end
    #
    # unless @newick
    #   @error_message = "Missing the Newick file."
    #   render(:error) and return
    # end



    if @newick
      basein = File.basename(@newick.original_filename,
                             File.extname(@newick.original_filename))
    else
      basein = "apple"
    end


    newick_str, color_map_str, name_map_str, biom_file_str = nil

    if @newick
      unless %w[text/plain application/octet-stream].include? @newick.content_type
        @error_message = "Newick file looks to be the wrong type. (Try adding .txt to the end of the file name....)"
        render(:error) and return
      end

      newick_path = @newick.tempfile.path
      newick_str = File.read(newick_path)
      newick_orig_fname = @newick.original_filename
    end

    if @color_map
      unless %w[text/plain application/octet-stream].include? @color_map.content_type
        @error_message = "Color map looks to be the wrong type. (Try adding .txt to the end of the file name....)"
        render(:error) and return
      end

      color_map_path = @color_map.tempfile.path
      color_map_str = File.read color_map_path
    end

    if @name_map
      unless %w[text/plain application/octet-stream].include? @name_map.content_type
        @error_message = "Name map looks to be the wrong type. (Try adding .txt to the end of the file name....)"
        render(:error) and return
      end

      name_map_path  = @name_map.tempfile.path
      name_map_str   = File.read name_map_path
    end

    if @biom_file
      unless %w[text/plain application/octet-stream].include? @biom_file.content_type
        @error_message = "Biom file looks to be the wrong type. (Try adding .txt to the end of the file name....)"
        render(:error) and return
      end

      biom_file_path = @biom_file.tempfile.path
      biom_file_str = File.read biom_file_path
    end

    if @min_lumin && @max_lumin
      if @min_lumin.to_i > @max_lumin.to_i
        @error_message = "Minimum luminosity (#{@min_lumin}}) was greater than maximum luminosity (#{@max_lumin})"
        render(:error) and return
      end

      @min_lumin = @min_lumin.to_i
      @max_lumin = @max_lumin.to_i
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
                                  fname: newick_orig_fname,
                                  upload_id: upload_id,
                                  iroki_input: iroki_input,
                                  min_lumin: @min_lumin,
                                  max_lumin: @max_lumin)

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
    @jobs_in_queue = Delayed::Job.all.count

    @job_id = params[:job_id]
    @dj_row_id = params[:dj_row_id]

    dj_rec = Delayed::Job.where(id: @dj_row_id)

    if dj_rec.empty? # it is def done
      # TODO assert exactly one
      iroki_output = IrokiOutput.where(dj_id: @job_id).first

      if iroki_output.nil?
        @stale_download_link = "Can't find you job (id: #{@job_id}) please submit again. Sorry!"
        render :error
      else


        @job_finished = "Yes"
        @iroki_result = iroki_output.send_result
        # IrokiOutput.destroy iroki_output.id

        if iroki_output.error # there was an AbortIf error
          @error_message = iroki_output.error

          # TODO spec me
          IrokiOutput.destroy iroki_output.id

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

def present_and_not_empty? obj
  obj && !obj.empty?
end
