local basalt = require("/Modules/basalt")
local debugMenu = require('/Modules/basaltDebug'):setBasalt(basalt)

local lampInteractor = require("lamp")

-- Creating the main frame
local main = basalt.createFrame()
local debugFrame = debugMenu:createDebugMenu(main, {'debugMenuFrame', 'debugMenuTextbox', 'debugMenuCheckbox'})

-- Adding a button to the main frame
local button = main:addButton() 
button:setPosition(4, 4) 
button:setSize(16, 3)

-- Function to update button text based on lamp state
local function updateButtonText()
    local lampState = lampInteractor.getStateLamp()
    -- local randomNumber = math.random(0, 1)
    -- local lampState = (randomNumber == 1)

    if lampState then
        button:setText("Lamp is ON")
    else
        button:setText("Lamp is OFF")
    end
    debugFrame.debug(tostring(lampState))
end

-- Function to periodically check for changes and update button text
local function updateButton()
    while true do
        -- Update button text based on lamp state
        updateButtonText()
        -- Wait for a certain period before checking again
        os.sleep(1) -- Adjust this value as needed
    end
end

-- Function to handle button click
local function buttonClick()
    -- Toggle lamp state
    local currentState = lampInteractor.getStateLamp()
    if currentState then
        lampInteractor.turnOffLamp()
    else
        lampInteractor.turnOnLamp()
    end
    -- Update button text immediately after toggling lamp state
    updateButtonText()
end

-- Set initial button text based on lamp state
updateButtonText()

-- Assigning the buttonClick function to the button's onClick event
button:onClick(buttonClick)

-- Start a separate thread to periodically update button text
parallel.waitForAny(updateButton, basalt.autoUpdate)
