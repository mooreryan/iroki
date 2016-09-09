class IrokiOutputMailer < ApplicationMailer
  default from: 'niclas1047@gmail.com'

  def success_email iroki_output
    @email = iroki_output.email
    @nexus = iroki_output.nexus

    mail to: @email, subject: "Your Iroki submission is complete"
    p "EYYYY OHHHHH"
  end

  def failure_email iroki_output
    @email = iroki_output.email
    @error_msg = iroki_output.error_msg
    @dj_id = iroki_output.dj_id

    mail to: @email, subject: "Your Iroki submission has completed with errors"
  end
end
