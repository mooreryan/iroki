require "rails_helper"

RSpec.describe IrokiInputsController, type: :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/iroki_inputs").to route_to("iroki_inputs#index")
    end

    it "routes to #new" do
      expect(:get => "/iroki_inputs/new").to route_to("iroki_inputs#new")
    end

    it "routes to #show" do
      expect(:get => "/iroki_inputs/1").to route_to("iroki_inputs#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/iroki_inputs/1/edit").to route_to("iroki_inputs#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/iroki_inputs").to route_to("iroki_inputs#create")
    end

    it "routes to #update via PUT" do
      expect(:put => "/iroki_inputs/1").to route_to("iroki_inputs#update", :id => "1")
    end

    it "routes to #update via PATCH" do
      expect(:patch => "/iroki_inputs/1").to route_to("iroki_inputs#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/iroki_inputs/1").to route_to("iroki_inputs#destroy", :id => "1")
    end

  end
end
