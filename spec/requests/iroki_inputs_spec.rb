require 'rails_helper'

RSpec.describe "IrokiInputs", type: :request do
  describe "GET /iroki_inputs" do
    it "works! (now write some real specs)" do
      get iroki_inputs_path
      expect(response).to have_http_status(200)
    end
  end
end
