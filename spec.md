# MZR Kids Games

## Current State
Four games exist: ColorMatchGame, ImageMatchGame, BikeGame, CarDodgeGame. All games have basic score tracking but no level system. Matching games use a fixed number of pairs/colors. Arcade games (bike, car) increase speed over time but don't display levels.

## Requested Changes (Diff)

### Add
- Level selection screen for ColorMatchGame (3 levels: Easy=3 colors, Medium=5 colors, Hard=6 colors)
- Level selection screen for ImageMatchGame (3 levels: Easy=4 pairs, Medium=6 pairs, Hard=8 pairs)
- Level display and progression in BikeGame (level increases every 10 points, displayed in header)
- Level display and progression in CarDodgeGame (level increases every 10 points, displayed in header)
- Level badges/indicators shown in game headers

### Modify
- ColorMatchGame: accept a `level` prop controlling number of colors used
- ImageMatchGame: accept a `level` prop controlling number of emoji pairs used
- BikeGame: show current level in header based on score milestones
- CarDodgeGame: show current level in header based on score milestones
- App.tsx / HomeScreen: show level select before launching matching games

### Remove
- Nothing removed

## Implementation Plan
1. Create a `LevelSelect` component that receives game name + 3 level options with descriptions, returns selected level
2. Update `ColorMatchGame` to accept `level: 1|2|3` prop, use 3/5/6 colors based on level
3. Update `ImageMatchGame` to accept `level: 1|2|3` prop, use 4/6/8 pairs based on level
4. Update `BikeGame` to compute and display `level = Math.floor(score/10) + 1` in header
5. Update `CarDodgeGame` to compute and display `level = Math.floor(score/10) + 1` in header
6. Update `App.tsx` to manage a `selectedLevel` state; show LevelSelect before ColorMatch/ImageMatch games
