-- integrator = peripheral.find("redstoneIntegrator")
-- if integrator == nil then error("not found") end
-- print(integrator.getAnalogInput("north"))


local inductionMatrix = peripheral.wrap("inductionPort_0")
print(inductionMatrix)
print(inductionMatrix.getEnergy())
print(inductionMatrix.getEnergyCapacity())

--TESTE


-- local basalt = require("basalt")
-- local main = basalt.createFrame()
-- local balScreen = basalt.createFrame()
-- local drive = peripheral.wrap("bottom")
-- local myThread = main:addThread()
-- balScreen:hide()
 
-- function makeMainScreen()
--     balScreen:hide()
--     local aLabel = main:addLabel()
--     aLabel:setFontSize(1)
--     aLabel:setText("Insert your card")
--     aLabel:setPosition(4, 4)
--     main:show()
-- end
-- function makeBalScreen()
--     main:hide()
--     local aLabel = balScreen:addLabel()
--     aLabel:setText("Your bal is 100000") 
--     aLabel:setFontSize(2)
--     balScreen:show()
-- end

-- while true do
--     if drive.isDiskPresent() then
--         makeBalScreen()
--         basalt.autoUpdate()
--     else
--         makeMainScreen()
--         basalt.autoUpdate()
--     end

--     basalt.autoUpdate()
--     os.sleep(0.05)
-- end

