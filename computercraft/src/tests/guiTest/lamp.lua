--funcoes para interagir com lampada

local lampModule = {}

--acender
function lampModule.turnOnLamp()
    integrator = peripheral.find("redstoneIntegrator")
    if integrator == nil then error("not found") end

    integrator.setOutput("south", true)
end

--apagar
function lampModule.turnOffLamp()
    integrator = peripheral.find("redstoneIntegrator")
    if integrator == nil then error("not found") end

    integrator.setOutput("south", false)
end

--retornar estado
function lampModule.getStateLamp()
    integrator = peripheral.find("redstoneIntegrator")
    if integrator == nil then error("not found") end

    valor = integrator.getAnalogInput("south")
    local valorBool = (valor > 0)

    return valorBool
end

return lampModule

-- turnOnLamp(integrator)
-- turnOffLamp(integrator)
-- valorRetornado = getStateLamp(integrator)
-- print(valorRetornado)