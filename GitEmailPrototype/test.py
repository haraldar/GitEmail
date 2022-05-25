import math
pi = str(math.pi)
while True:
    dp = int(input('How many decimal points of pi?: '))
    pi = (pi[:dp] + pi[-dp:])
    pi = float(pi)