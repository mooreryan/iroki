require 'rails_helper'

RSpec.describe "iroki_outputs/show", type: :view do
  before(:each) do
    @iroki_output = assign(:iroki_output, IrokiOutput.create!(
      :email => "Email",
      :nexus => "MyText",
      :error => "MyText",
      :dj_id => 2
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Email/)
    expect(rendered).to match(/MyText/)
    expect(rendered).to match(/MyText/)
    expect(rendered).to match(/2/)
  end
end
