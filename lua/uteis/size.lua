local function getSize(path)
    local totalSize = 0

    if fs.isDir(path) then
        local items = fs.list(path)
        for _, item in ipairs(items) do
            totalSize = totalSize + getSize(fs.combine(path, item))
        end
    else
        totalSize = fs.getSize(path)
    end

    return totalSize
end

-- Example usage:
local directoryPath = "/CC"
local size = getSize(directoryPath)
print("Size of directory " .. directoryPath .. " is: " .. size .. " bytes")
