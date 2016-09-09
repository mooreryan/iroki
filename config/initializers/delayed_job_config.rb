Delayed::Worker.destroy_failed_jobs = false
Delayed::Worker.max_run_time = 15.minutes

# Raise exceptions on SIGTERM signals
Delayed::Worker.raise_signal_exceptions = :term