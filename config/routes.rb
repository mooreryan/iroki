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

  get 'biom' => 'pages#biom', as: :biom

  get 'large' => 'pages#canvas_viewer', as: :large
  get 'cluster' => 'pages#tree_cluster', as: :tree_cluster


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
