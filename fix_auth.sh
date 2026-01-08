#!/bin/bash
sed -i 's/px-6 pt-16 pb-8/px-6 pt-8 pb-6 overflow-y-auto/' client/src/pages/AuthPage.tsx
sed -i 's/justify-between mb-8/justify-between mb-4/' client/src/pages/AuthPage.tsx
sed -i 's/text-center mb-8/text-center mb-4/' client/src/pages/AuthPage.tsx
sed -i 's/h-56 mx-auto mb-6/h-32 mx-auto mb-3/' client/src/pages/AuthPage.tsx
sed -i 's/className="h-52 w-auto/className="h-28 w-auto/' client/src/pages/AuthPage.tsx
sed -i 's/text-2xl font-bold text-foreground mb-2/text-xl font-bold text-foreground mb-1/' client/src/pages/AuthPage.tsx
sed -i 's/<p className="text-muted-foreground">/<p className="text-sm text-muted-foreground">/' client/src/pages/AuthPage.tsx
sed -i 's/h-14 text-base/h-11 text-sm/g' client/src/pages/AuthPage.tsx
sed -i 's/h-14 text-lg/h-11 text-base/' client/src/pages/AuthPage.tsx
sed -i 's/my-6/my-4/' client/src/pages/AuthPage.tsx
echo "AuthPage layout fixed"
