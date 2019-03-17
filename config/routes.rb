Rails.application.routes.draw do
  # For testing JS
  mount MagicLamp::Genie, at: "/magic_lamp" if defined?(MagicLamp)

  # resources :iroki_inputs
  # resources :iroki_outputs
  root 'pages#home'

  get 'about' => 'pages#about', as: :about # gives you about_path
  get 'contact' => 'pages#contact', as: :contact # gives you contact_path
  get 'citation' => 'pages#citation', as: :citation # gives you citation_path

  get 'docs' => 'pages#docs', as: :docs
  get 'docs_newick' => 'pages#docs_newick', as: :docs_newick
  get 'docs_mapping_files' => 'pages#docs_mapping_files', as: :docs_mapping_files
  get 'docs_styling_opts' => 'pages#docs_styling_opts', as: :docs_styling_opts
  get 'docs_branch_styling' => 'pages#docs_branch_styling', as: :docs_branch_styling
  get 'docs_mapping_file_priority' => 'pages#docs_mapping_file_priority', as: :docs_mapping_file_priority

  # palette info
  get 'docs_palettes' => 'pages#docs_palettes', as: :docs_palettes

  get 'biom' => 'pages#biom', as: :biom

  get 'large' => 'pages#canvas_viewer', as: :large
  get 'cluster' => 'pages#tree_cluster', as: :tree_cluster

  get 'pd' => 'pages#pd', as: :pd

  get 'classify' => 'pages#classify', as: :classify


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
