class IrokiOutputsController < ApplicationController
  before_action :set_iroki_output, only: [:show, :edit, :update, :destroy]

  # GET /iroki_outputs
  # GET /iroki_outputs.json
  def index
    @iroki_outputs = IrokiOutput.all
  end

  # GET /iroki_outputs/1
  # GET /iroki_outputs/1.json
  def show
  end

  # GET /iroki_outputs/new
  def new
    @iroki_output = IrokiOutput.new
  end

  # GET /iroki_outputs/1/edit
  def edit
  end

  # POST /iroki_outputs
  # POST /iroki_outputs.json
  def create
    @iroki_output = IrokiOutput.new(iroki_output_params)

    respond_to do |format|
      if @iroki_output.save
        format.html { redirect_to @iroki_output, notice: 'Iroki output was successfully created.' }
        format.json { render :show, status: :created, location: @iroki_output }
      else
        format.html { render :new }
        format.json { render json: @iroki_output.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /iroki_outputs/1
  # PATCH/PUT /iroki_outputs/1.json
  def update
    respond_to do |format|
      if @iroki_output.update(iroki_output_params)
        format.html { redirect_to @iroki_output, notice: 'Iroki output was successfully updated.' }
        format.json { render :show, status: :ok, location: @iroki_output }
      else
        format.html { render :edit }
        format.json { render json: @iroki_output.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /iroki_outputs/1
  # DELETE /iroki_outputs/1.json
  def destroy
    @iroki_output.destroy
    respond_to do |format|
      format.html { redirect_to iroki_outputs_url, notice: 'Iroki output was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_iroki_output
      @iroki_output = IrokiOutput.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def iroki_output_params
      params.require(:iroki_output).permit(:nexus, :error, :dj_id)
    end
end
