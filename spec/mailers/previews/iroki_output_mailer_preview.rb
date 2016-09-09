# Preview all emails at http://localhost:3000/rails/mailers/iroki_output_mailer
class IrokiOutputMailerPreview < ActionMailer::Preview
  def success_email
    IrokiOutputMailer.success_email IrokiOutput.new email: "foo@bar.com", dj_id: "1", nexus: "(1,(2,3));"
  end
end
