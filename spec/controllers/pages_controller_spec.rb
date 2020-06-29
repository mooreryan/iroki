require 'rails_helper'

routes = [:about,
          :biom,
          :canvas_viewer,
          :classify,
          :contact,
          :citation,
          :pd,
          :tree_cluster,
          :viewer]

RSpec.describe PagesController, type: :controller do
  # @note Everything that should render :error here is handled by controller logic

  shared_examples_for "returns http success" do |route|
    describe "GET ##{route}" do
      it "returns http success" do
        get route.to_sym
        expect(response).to have_http_status(:success)
      end
    end
  end

  routes.each do |route|
    include_examples "returns http success", route
  end
end
