local socketPort = "5000"
local serverURL = "ws://localhost:" .. socketPort .. "/"
-- local serverURL = "wss://ccapi.567437965.xyz/"

local function handleWebSocketMessage(message)
    local response = ""

    print("Received message from client: " .. message)

    if message == "energy" then
        response = math.random(0, 100)
    else 
        response = "Invalid request"
    end

    return response
end

local function openWebSocket()
    local ws, err = http.websocket(serverURL)

    if not ws then
        print("Failed to open websocket: " .. err)
        return
    end

    print("Websocket opened successfully")
    print(serverURL)

    local token = "123456789"
    local isFirst = true
    while true do
        if isFirst == true then
            print("Sending token to server")
            print(token)
            ws.send(token)
            isFirst = false
        end

        local event, url, message = os.pullEvent("websocket_message")
        response = handleWebSocketMessage(message)
        ws.send(response)

        --sleep for 1 second
        os.sleep(1)
        
    end

end

openWebSocket()
