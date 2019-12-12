Rails.application.routes.draw do
  # For testing JS
  mount MagicLamp::Genie, at: "/magic_lamp" if defined?(MagicLamp)

  root 'pages#splash'

  get 'viewer' => 'pages#viewer', as: :viewer

  get 'about' => 'pages#about', as: :about # gives you about_path
  get 'contact' => 'pages#contact', as: :contact # gives you contact_path
  get 'citation' => 'pages#citation', as: :citation # gives you citation_path


  get 'biom' => 'pages#biom', as: :biom

  get 'large' => 'pages#canvas_viewer', as: :large
  get 'cluster' => 'pages#tree_cluster', as: :tree_cluster

  get 'pd' => 'pages#pd', as: :pd

  get 'classify' => 'pages#classify', as: :classify
end
