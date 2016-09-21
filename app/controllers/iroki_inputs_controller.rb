class IrokiInputsController < ApplicationController
  before_action :set_iroki_input, only: [:show, :edit, :update, :destroy]

  # GET /iroki_inputs
  # GET /iroki_inputs.json
  def index
    @iroki_inputs = IrokiInput.all
  end

  # GET /iroki_inputs/1
  # GET /iroki_inputs/1.json
  def show
  end

  # GET /iroki_inputs/new
  def new
    @iroki_input = IrokiInput.new
  end

  # GET /iroki_inputs/1/edit
  def edit
  end

  # POST /iroki_inputs
  # POST /iroki_inputs.json
  def create
    @iroki_input = IrokiInput.new(iroki_input_params)

    respond_to do |format|
      if @iroki_input.save
        format.html { redirect_to @iroki_input, notice: 'Iroki input was successfully created.' }
        format.json { render :show, status: :created, location: @iroki_input }
      else
        format.html { render :new }
        format.json { render json: @iroki_input.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /iroki_inputs/1
  # PATCH/PUT /iroki_inputs/1.json
  def update
    respond_to do |format|
      if @iroki_input.update(iroki_input_params)
        format.html { redirect_to @iroki_input, notice: 'Iroki input was successfully updated.' }
        format.json { render :show, status: :ok, location: @iroki_input }
      else
        format.html { render :edit }
        format.json { render json: @iroki_input.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /iroki_inputs/1
  # DELETE /iroki_inputs/1.json
  def destroy
    @iroki_input.destroy
    respond_to do |format|
      format.html { redirect_to iroki_inputs_url, notice: 'Iroki input was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_iroki_input
      @iroki_input = IrokiInput.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def iroki_input_params
      params.require(:iroki_input).permit(:upload_id, :newick_str)
    end
end
