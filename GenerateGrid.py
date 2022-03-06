#  ---------- Imports

import argparse
import os
import random

from PIL import Image

#  ---------- Constants

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

# ---------- Argument parser

parser = argparse.ArgumentParser()
# Mandatory args
parser.add_argument('gridSize', type=int, help='Size of the grid (e.g. 4 will create a 4x4 grid and needs 16 letters.')
parser.add_argument('letters', type=str, help='Sequence of letters for the grid.')
parser.add_argument('orientLetters', type=str, help='If True, this will randomly orient dices (like in the true game).')
parser.add_argument('lettersDirectory', type=str, help='Input directory for letters images.')
parser.add_argument('outputFilePath', type=str, help='Desired output file path.')
args = parser.parse_args()

# ---------- Main script

squareSize = int(args.gridSize * 100) # each letter is a 100px square 
gridImage = Image.new('RGB', (squareSize, squareSize), (255, 255, 255))
rotations = [0, 90, 180, 270]  # in degrees
oneLetterSize = 100

# 0,0 is the top left corner
currentLine = 0
currentColumn = 0
# One iteration = one letter of the sequence
for letter in args.letters:

    # Find corresponding image
    letterImage = Image.open('letters/' + letter + '.png')

    # Paste it at right coordinates on grid
    leftPosPx = currentColumn * oneLetterSize
    topPosPx = currentLine * oneLetterSize

    # Randomize the letter position if the option is enabled
    if args.orientLetters in ['True', 'true']:
        angle = rotations[random.randint(0, 3)]  # randint(0,3) -> [0,3]
        letterImage = letterImage.rotate(angle)

    gridImage.paste(letterImage, (leftPosPx, topPosPx))
    currentColumn += 1

    if currentColumn == args.gridSize:
        # reset column and increment line
        currentColumn = 0
        currentLine += 1

# Save the grid image
gridImage.save(args.outputFilePath, "PNG")