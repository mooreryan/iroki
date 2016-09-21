require 'rails_helper'

RSpec.describe IrokiJob, type: :job do
  include ActiveJob::TestHelper

  let(:test_dir) { File.join File.dirname(__FILE__), "..", "test_files" }
  before(:each) { ActiveJob::Base.queue_adapter = :test }

  subject(:job) { described_class.perform_later }

  it "handles no args" do
    expect { job }.to have_enqueued_job IrokiJob
  end

  it "puts the job in the iroki queue" do
    expect { job }.to have_enqueued_job.on_queue "iroki"
  end

  it "handles error if fname nil" do
    expect { IrokiJob.perform_now fname: nil }.to raise_error ArgumentError
  end

  context "after enqueue" do
    it "creates a new record in IrokiOutput" do
      expect { job }.to change(IrokiOutput.all, :count).by 1
    end

    it "sets the IrokiOutput dj_id to the job_id of the DJ rec" do
      ijob = IrokiJob.perform_later
      ijob_id = ijob.job_id

      expect(IrokiOutput.last.dj_id).to eq ijob_id
    end

    it "sets the filename attr" do
      fname = "apple"
      IrokiJob.perform_later fname: fname

      expect(IrokiOutput.last.filename).to eq fname
    end
  end

  context "after perform" do
    it "adds the nexus string to the IrokiOutput record" do
      use_delayed_job

      newick = File.read File.join test_dir, "basic.tre"
      color_map = File.read File.join test_dir, "basic.color_map"
      nexus = File.read File.join test_dir, "basic.nex"
      upload_id = "arstoien"

      iroki_input = IrokiInput.new upload_id: upload_id,
                                   newick_str: newick,
                                   color_map_str: color_map
      iroki_input.save!

      IrokiJob.perform_later fname: "apple",
                             iroki_input: iroki_input,
                             color_branches: true,
                             color_taxa_names: true,
                             exact: true

      run_last_job

      expect(IrokiOutput.last.nexus).to eq nexus
    end
  end

  it "handles AbortIf errors"

  after(:each) do
    if ActiveJob::Base.queue_adapter == :test
      clear_enqueued_jobs
      clear_performed_jobs
    end
  end
end

def use_delayed_job
  ActiveJob::Base.queue_adapter = :delayed_job
end

def run_last_job
  dw = Delayed::Worker.new
  dj = Delayed::Job.last
  dw.run dj
end