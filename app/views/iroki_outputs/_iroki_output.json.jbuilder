json.extract! iroki_output, :id, :nexus, :error, :dj_id, :created_at, :updated_at
json.url iroki_output_url(iroki_output, format: :json)