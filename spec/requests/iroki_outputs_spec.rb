require 'rails_helper'

RSpec.describe "IrokiOutputs", type: :request do
  describe "GET /iroki_outputs" do
    it "works! (now write some real specs)" do
      get iroki_outputs_path
      expect(response).to have_http_status(200)
    end
  end
end
