json.extract! iroki_input, :id, :upload_id, :newick_str, :created_at, :updated_at
json.url iroki_input_url(iroki_input, format: :json)