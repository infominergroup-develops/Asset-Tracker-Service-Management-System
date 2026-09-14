import os

filepath = 'src/components/Header.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace inactive tab colors for light theme
content = content.replace(
    "'text-slate-300 hover:text-white hover:bg-slate-800'",
    "'text-slate-600 hover:text-slate-900 hover:bg-slate-200'"
)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated tab colors in Header.tsx")
