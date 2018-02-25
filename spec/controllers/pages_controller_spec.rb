require 'rails_helper'

RSpec.describe PagesController, type: :controller do
  describe "GET #home" do
    it "returns http success" do
      get :home
      expect(response).to have_http_status(:success)
    end
  end

  # @note Everything that should render :error here is handled by controller logic


  describe "GET #contact" do
    it "returns http success" do
      get :contact
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #citation" do
    it "returns http success" do
      get :citation
      expect(response).to have_http_status(:success)
    end
  end

end
