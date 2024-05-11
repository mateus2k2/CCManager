
--[[
    Author: jebjordan
        (most of the code is from the original source, just kinda tinkered with it a bit)
        Snippets and such from the official basalt debug module code. Adapted to fix it and make it work as a module or whatever
        basalt.lua, tHex.lua, and utils.lua taken directly from the basalt repo.

    Usage:
        local basalt = require('Modules/basalt')
        local debugMenu = require('Modules/basaltDebug') -- (shittyDebug.lua renamed to basaltDebug.lua)
        local mainFrame = basalt.createFrame()
        debugMenu:setBasalt(basalt)
        local debugFrame = debugMenu:createDebugMenu(mainFrame, {'debugMenuFrame', 'debugMenuTextbox', 'debugMenuCheckbox'})
        debugFrame.debug('test: '..i)



    See: t3.lua for test code
--]]



if not fs.exists("Modules") then
    shell.run("mkdir Modules")
end
if not fs.exists("basaltDebugModules") then
    shell.run("mkdir basaltDebugModules")
end
if not fs.exists("Modules/basalt.lua") then
    shell.run("wget run https://basalt.madefor.cc/install.lua packed Modules/basalt.lua master")
end
if not fs.exists("basaltDebugModules/utils.lua") then
    shell.run("wget https://github.com/jebjordan/basaltDebugFrame/raw/main/basaltDebugModules/utils.lua basaltDebugModules/utils.lua")
end
if not fs.exists("basaltDebugModules/tHex.lua") then
    shell.run("wget https://github.com/jebjordan/basaltDebugFrame/raw/main/basaltDebugModules/tHex.lua basaltDebugModules/tHex.lua")
end

local basalt-- = require("Modules/basalt")
local utils = require("basaltDebugModules/utils")

local debugMenu = {
    --counter=0
}


---function to set the basalt variable so that menus can be made.
---@return table
---@type fun(self: table, basaltVar: table): table
function debugMenu:setBasalt(basaltVar)
    assert(basaltVar, "basalt Variable not Provided")
    basalt = basaltVar;
    return self
end

---function to create the debug menu.
---returns a table with all of the parts of the debug menu, so that the calling function can modify them if so desired.
---@return table
---@type fun(self: table, basaltFrame: table, designations: table?): table
function debugMenu:createDebugMenu(basaltFrame, designations)
    assert(basalt, "The `basalt` variable has not yet been set")
    assert(basaltFrame and type(basaltFrame)=="table", ("Type of provided `basaltFrame` not of correct type. Provided type: %s"):format(type(basaltFrame) or "nil"))
    if designations then
        assert(type(designations)=="table", "Please provide a designation table properly. Example: {'debugMenuFrame', 'debugMenuTextbox', 'debugMenuCheckbox'}")
    else
        designations = {}
    end
    local thisMenu = {}
    
    local minW = 16
    local minH = 6
    local maxW = 99
    local maxH = 99
    local w, h = basaltFrame:getSize()
    
    local debugMenuFrame = basaltFrame:addMovableFrame(designations[1])
        :setSize(w-10, h-6)--("{parent.w/1.5}", "{parent.h/3}")
        :setBackground(colours.black, "#", colours.yellow)
        :setForeground(colours.white)

        debugMenuFrame:addPane():setSize("{parent.w}", 1):setPosition(1, 1):setBackground(colors.red):setForeground(colors.black):setZ(99)
        debugMenuFrame:setPosition(-w, h/2-debugMenuFrame:getHeight()/2):setBorder(colors.cyan)
    
    local debugMenuTextbox = debugMenuFrame:addTextfield(designations[2])-- "debugMenuTextbox:"..(designation or debugMenu.counter) )
        :setSize("{parent.w}", "{parent.h-1}")
        :setPosition(0, 1)
        :setBackground(colours.black, "/", colours.grey)

    local debugMenuCheckbox = basaltFrame:addCheckbox(designations[3])-- "debugMenuCheckbox:"..(designation or debugMenu.counter) )
        :setSize(1, 1)
        :setPosition("{parent.w-self.w-1}", "{parent.h-self.h-1}")
        :setBackground(colours.green, "$", colours.grey)
        :setZ(100)
        :onChange(function(self, ...)
            local checked = self:getValue()

            -- now attempting to bring the textbox up
            local debugMenuTextboxX, debugMenuTextboxY = debugMenuTextbox:getPosition(designations[4])
            if checked == false then
                
                ---> below is the middle of the screen
                --debugMenuFrame:animatePosition(w/2-debugMenuFrame:getWidth()/2, h/2-debugMenuFrame:getHeight()/2, 0.5)
                ---> below is the bottom of the screen with an offset of 1
                debugMenuFrame:animatePosition(2, h-debugMenuFrame:getHeight(), 0.5)
                
                self:setParent(debugMenuFrame)
                    :setPosition("{parent.w - 7}", 1)
                    :setText("Close")
                    :setSize(7, 1)
                    :setBackground(colors.red)
                    :setForeground(colors.white)

            else
                debugMenuFrame:animatePosition(-w, h/2-debugMenuFrame:getHeight()/2)
                self:setParent(basaltFrame)
                    :setSize(1, 1)
                    :setBackground(colours.green, "$", colours.grey)
                    :setPosition("{parent.w-self.w-1}", "{parent.h-self.h-1}")

            end

        end)
    
    local resizeButton = debugMenuFrame:addButton()
        :setPosition("{parent.w-1}", "{parent.h-1}")
        :setSize(1, 1)
        :setText("\133")
        :setForeground(colors.black)
        :setBackground(colors.cyan)
        :setZ(12)
        :onClick(function() end)
        :onDrag(function(self, event, btn, xOffset, yOffset)
            local w, h = debugMenuFrame:getSize()
            local wOff, hOff = w, h
            if(w+xOffset-1>=minW)and(w+xOffset-1<=maxW)then
                wOff = w+xOffset-1
            end
            if(h+yOffset-1>=minH)and(h+yOffset-1<=maxH)then
                hOff = h+yOffset-1
            end
            debugMenuFrame:setSize(wOff, hOff)
        end)
    
    local debugList = debugMenuFrame:addList()
        :setSize("{parent.w - 2}", "{parent.h - 3}")
        :setPosition(2, 3)
        :setBackground(colors.black)
        :setForeground(colors.white)
        :setSelectionColor(colors.black, colors.white)

    local debugLabel = basaltFrame:addLabel()
        :setPosition(1, "{parent.h-1}")
        :setBackground(colors.black)
        :setForeground(colors.white)
        :setZ(100)
        :onClick(function()
                debugMenuFrame:show()
                --debugMenuFrame:animatePosition(w/2-debugMenuFrame:getWidth()/2, h/2-debugMenuFrame:getHeight()/2, 0.5)
                --debugMenuFrame:animatePosition(2, h-debugMenuFrame:getHeight(), 0.5)
                debugMenuCheckbox:setValue(true) -- rather than moving the position in here, you can just change the value and thus it'll be changed back in the checkbox code. Also makes the checkbox match the menu state.
            end)
        :hide()

    local createdDebugMenu = {
        debugMenuFrame = debugMenuFrame,
        debugMenuTextbox = debugMenuTextbox,
        debugMenuCheckbox = debugMenuCheckbox,
        resizeButton = resizeButton,
        debugList = debugList,
        debugLabel = debugLabel

    }
    thisMenu.createdDebugMenu = createdDebugMenu

    --if not designations then debugMenu.counter = debugMenu.counter + 1; end;

    ---function to add debug text to the debug menu. It also shows the most recent text and allows clicking on said text to open the menu.
    ---@return nil
    ---@type fun(...: unknown): nil
    function thisMenu.debug(...)
        local args = { ... }
        
        local str = ""
        for key, value in pairs(args) do
            str = str .. tostring(value) .. (#args ~= key and ", " or "")
        end
        debugLabel:setText("[Debug] " .. str)
        for k,v in pairs(utils.wrapText(str, debugList:getWidth()))do
            debugList:addItem(v)
        end
        if (debugList:getItemCount() > 50) then
            debugList:removeItem(1)
        end
        debugList:setValue(debugList:getItem(debugList:getItemCount()))
        if(debugList.getItemCount() > debugList:getHeight())then
            debugList:setOffset(debugList:getItemCount() - debugList:getHeight())
        end
        debugLabel:show()
        local hideTimer = basaltFrame:addTimer()
            :setTime(3)
            :onCall(function(...) debugLabel:hide() end)
        hideTimer:start()


    end
    thisMenu.debugFrame = debugMenuFrame
    return thisMenu; --createdDebugMenu
end


return debugMenu
