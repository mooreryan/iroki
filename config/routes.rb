Rails.application.routes.draw do
  # resources :iroki_inputs
  # resources :iroki_outputs
  root 'pages#home'
  post 'submit' => 'pages#submit', as: :submit
  post 'jobs'   => 'pages#jobs'

  get 'about'    => 'pages#about',           as: :about # gives you about_path
  get 'contact'  => 'pages#contact',         as: :contact # gives you contact_path
  get 'citation' => 'pages#citation',        as: :citation # gives you citation_path
  get 'download' => 'pages#download_result', as: :download
  get 'error' => 'pages#error', as: :error
  # get 'jobs'     => 'pages#jobs',     as: :jobs

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
