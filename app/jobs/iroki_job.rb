class IrokiJob < ApplicationJob
  queue_as :iroki

  # rescue_from(AbortIf::Error) do |exception|
  #   # Email user about the error
  # end

  after_enqueue do |job|
    id = job.job_id
    iroki_out = IrokiOutput.new dj_id: id
    iroki_out.save!
  end

  after_perform do |job|
    iroki_out = IrokiOutput.where(dj_id: job.job_id).first

    # TODO assert that there are matches
    # TODO assert that match is unique

    iroki_out.nexus = @result

    iroki_out.save!
  end

  # rescue_from(AbortIf::Error) do |ex|
  #   p "RESCUE ERROR"
  #   iroki_out = IrokiOutput.where(dj_id: self.job_id).first
  #
  #   iroki_out.error = ex.message
  #
  #   iroki_out.save!
  # end
  #
  # rescue_from(AbortIf::Exit) do |ex|
  #   p "RESCUE EXIT"
  #   iroki_out = IrokiOutput.where(dj_id: self.job_id).first
  #
  #   iroki_out.error = ex.message
  #
  #   iroki_out.save!
  # end

  def perform(color_branches: nil,
              color_taxa_names: nil,
              exact: nil,
              remove_bootstraps_below: nil,
              color_map_f: nil,
              biom_f: nil,
              single_color: nil,
              name_map_f: nil,
              auto_color: nil,
              display_auto_color_options: nil,
              newick_f: nil,
              out_f: nil)

    sleep 2

    begin
      @result = Iroki::Main::main(color_branches: color_branches,
                                  color_taxa_names: color_taxa_names,
                                  exact: exact,
                                  remove_bootstraps_below: remove_bootstraps_below,
                                  color_map_f: color_map_f,
                                  biom_f: biom_f,
                                  single_color: single_color,
                                  name_map_f: name_map_f,
                                  auto_color: auto_color,
                                  display_auto_color_options: display_auto_color_options,
                                  newick_f: newick_f,
                                  out_f: out_f)
    rescue AbortIf::Exit => ex
      handle_error ex
    rescue AbortIf::Error => ex
      handle_error ex
    end
  end

  def handle_error ex
    iroki_out = IrokiOutput.where(dj_id: self.job_id).first

    iroki_out.error = ex.message.sub(/Try iroki --help for help.$/, '')

    iroki_out.save!
  end
end
