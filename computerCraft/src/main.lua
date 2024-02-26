--------------------------------------------------------------------------------
-- GERADOR MAIN 
--------------------------------------------------------------------------------

-- shell.run("/CC/computercraft/src/GeneratorManager/Generator.lua")

--------------------------------------------------------------------------------
-- GERADOR GUI 
--------------------------------------------------------------------------------

-- shell.run("/CC/computercraft/src/GeneratorManager/GUI.lua")

--------------------------------------------------------------------------------
-- GUI TESTE
--------------------------------------------------------------------------------

-- shell.run("/CC/computerCraft/src/tests/guiTest/menager.lua")

--------------------------------------------------------------------------------
-- REPO TESTE
--------------------------------------------------------------------------------


-- ./CCGit-1.2/files/Shell/git "get" "mateus2k2" "CCManager" "master" "computerCraft/Modules" "teste"

-- Function to fetch contents of a URL
local function fetch(url)
    local response = http.get(url)
    if response then
        local content = response.readAll()
        response.close()
        return content
    else
        error("Failed to fetch URL: " .. url)
    end
end

-- Function to extract filenames from HTML content
local function extractFilenames(htmlContent)
    local filenames = {}
    for filename in htmlContent:gmatch('href="([^"]+)"') do
        if filename ~= "../" then -- Exclude parent directory link
            table.insert(filenames, filename)
        end
    end
    return filenames
end

-- Function to get all files in a given path of a Git repository
local function getFilesFromGitRepo(repoURL, path)
    local url = repoURL .. "/tree/master/" .. path
    local htmlContent = fetch(url)
    local filenames = extractFilenames(htmlContent)
    return filenames
end

-- Example usage
local repoURL = "https://github.com/mateus2k2/CCManager"
local path = "computerCraft" -- Specify the path within the repository
local files = getFilesFromGitRepo(repoURL, path)

-- Print the list of files
print("Files in '" .. path .. "':")
for _, filename in ipairs(files) do
    print(filename)
end
