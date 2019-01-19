#!/bin/sh

jsfiles=$(git diff --cached --name-only --diff-filter=ACM "*.ts" "*.tsx" | tr '\n' ' ')

echo "Running prettify staged on files:"
echo $jsfiles

[ -z "$jsfiles" ] && exit 0

# Prettify all staged .js files
echo "$jsfiles" | xargs ./node_modules/.bin/prettier --write --config .prettierrc

# Add back the modified/prettified files to staging
echo "$jsfiles" | xargs git add

exit 0