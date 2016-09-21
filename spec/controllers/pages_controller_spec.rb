require 'rails_helper'

def delete_keys hash, keys
  keys.each { |key| hash.delete key }
end

RSpec.describe PagesController, type: :controller do
  let(:newick_file) {
    fixture_file_upload("files/color_map_override.tre", "application/octet-stream")
  }
  let(:color_map) {
    fixture_file_upload("files/color_map_override.color_map",
                        "application/octet-stream")
  }
  let(:name_map) {
    fixture_file_upload("files/color_map_override.color_map",
                        "application/octet-stream")
  }
  let(:biom_file) {
    fixture_file_upload("files/color_map_override.biom",
                        "application/octet-stream")
  }
  let(:params_hash) {
    { newick_file: newick_file,
      color_map: color_map,
      name_map: name_map,
      biom_file: biom_file, }
  }

  describe "GET #home" do
    it "returns http success" do
      get :home
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST #submit" do
    shared_examples_for "when missing file" do |*fnames|
      context "when missing #{fnames.join ', '}" do
        it "renders error page" do
          delete_keys params_hash, fnames

          expect(post :submit, params: params_hash).to render_template :error
        end

        it "sets @error_message" do
          delete_keys params_hash, fnames

          post :submit, params: params_hash

          expect(controller.instance_variables).to include :@error_message
        end
      end
    end

    subject { post :submit, params: params_hash }

    it "returns http success" do
      post :submit
      expect(response).to have_http_status(:success)
    end

    it "renders the jobs template" do
      expect(subject).to render_template :jobs
    end

    context "when the form isn't properly filled out" do
      include_examples "when missing file", :newick_file
      include_examples "when missing file", :color_map, :name_map, :biom_file
    end
  end

  describe "GET #about" do
    it "returns http success" do
      get :about
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #contact" do
    it "returns http success" do
      get :contact
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #error" do
    it "returns http success" do
      get :error
      expect(response).to have_http_status(:success)
    end
  end

end
