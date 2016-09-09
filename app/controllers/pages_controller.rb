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

    newick_path    = @newick.tempfile.path if @newick
    color_map_path = @color_map.tempfile.path if @color_map
    name_map_path  = @name_map.tempfile.path if @name_map
    biom_file_path = @biom_file.tempfile.path if @biom_file

    outf =
        Tempfile.new ["#{basein}.", ".nex"]

    # begin
    flash.now[:notice] = "Processing #{newick_path}"

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
                                  out_f: outf.path)

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
    @jawn = 2342
    @job_finished = "No"
    @foo = FooJob.perform_later email: "arstnen@gmail.com"
    @job_id = @foo.job_id
    @jobs_in_queue = Delayed::Job.all.count
    @dj_row_id = @foo.provider_job_id
    # IrokiJob.perform_later email: "foo", exact: "apple"
    render :jobs
  end

  def error
  end

  def citation
    BarJob.perform_later

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

      @job_finished = "Yes"
      @iroki_result = iroki_output.send_result

      # TODO render error on error, not send it as a file
      if iroki_output.error # there was an AbortIf error
        @error_message = iroki_output.error
        render :error
      else
        time = Time.now.strftime("%Y-%m-%d-%H-%M-%S-%L")
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
    else
      @job_finished = "No"
    end
  end

  def download_result
    # TODO ensure this is deleted afterwards?
    send_file params[:file_path], type: "text"
  end

  def num_jobs_in_queue
    @jobs_in_queue = Delayed::Job.all.count
  end
end
