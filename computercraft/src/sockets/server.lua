-- local ws = assert(http.websocket("ws://localhost:8585"))
-- ws.send("Hello!") -- Send a message
-- print(ws.receive()) -- And receive the reply
-- ws.close()

local serverURL = "ws://localhost:8585"

local function handleWebSocketMessage(message)
    print("Received message from client: " .. message)
end

local function openWebSocket()
    local ws, err = http.websocketAsync(serverURL)

    if not ws then
        print("Failed to open websocket: " .. err)
        return
    end

    print("Websocket opened successfully")

    while true do
        local event, url, message = os.pullEvent("websocket_message")
        handleWebSocketMessage(message)
    end
end

openWebSocket()
