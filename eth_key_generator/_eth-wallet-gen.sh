#!/bin/bash

# Reference: https://github.com/vkobel/ethereum-generate-wallet
# https://kobl.one/blog/create-full-ethereum-keypair-and-address/

totalGenKeyPairs=10
declare -a KEYPAIRS_ADDR
declare -a KEYPAIRS_PRIV

while getopts :n opt; do
  case $opt in
    n)
      totalGenKeyPairs=$OPTARG;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

echo "# Ethereum Wallet Generator"
echo "# How many keypairs would you like to generate? (type in the number you would like, e.g '5' will generate 5 keypairs.)"

read totalGenKeyPairs

if [ "$totalGenKeyPairs" -eq "$totalGenKeyPairs" ] 2>/dev/null; then #this checks if input is numeric
  if [ $totalGenKeyPairs -eq "0" ]; then
    echo "# You typed in 0. No keys will be generated. Exiting!";
    exit 0
  fi
  echo "ok - will be generating $totalGenKeyPairs key pairs"
else
  totalGenKeyPairs=10
  echo "ok - default setting to $totalGenKeyPairs key pairs"
fi

echo "# You typed in: $totalGenKeyPairs, will generate those now.";

idx=0
while [ $idx -lt $totalGenKeyPairs ]
do
  keys=$(openssl ecparam -name secp256k1 -genkey -noout | openssl ec -text -noout 2> /dev/null)

  # extract private key in hex format, removing newlines, leading zeroes and semicolon
  priv=$(printf "%s\n" $keys | grep priv -A 3 | tail -n +2 | tr -d '\n[:space:]:' | sed 's/^00//')

  # make sure the private key has correct length
  if [ ${#priv} -ne 64 ]; then
      continue
  fi

  # extract public key in hex format, removing newlines, leading '04' and semicolon
  pub=$(printf "%s\n" $keys | grep pub -A 5 | tail -n +2 | tr -d '\n[:space:]:' | sed 's/^04//')

  # get the keecak hash, removing the trailing ' -' and taking the last 40 chars
  # https://github.com/maandree/sha3sum
  addr=0x$(echo $pub | keccak-256sum -x -l | tr -d ' -' | tail -c 41)

  cross_chk=$(echo $addr | tr [:upper:] [:lower:])
  empty_addr=$(echo -n "0xdcc703c0E500B653Ca82273B7BFAd8045D85a470" | tr [:upper:] [:lower:])
  if [ "$cross_chk" = "$empty_addr" ] ; then
    echo "warn - how lucky you are to get an empty public key address $empty_addr :-) skipping and generate new one."
    continue
  fi
  echo "ok - generated key pair idx=$idx"
  # echo "$addr;$priv;$pub";
  KEYPAIRS_ADDR[$idx]="$addr"
  KEYPAIRS_PRIV[$idx]="$priv"
  let idx=idx+1
done # end while

# Print out truffle friendly format
max_idx="${#KEYPAIRS_ADDR[@]}"
let max_idx=max_idx-1
for i in $(seq 0 $max_idx)
do
  addr=${KEYPAIRS_ADDR[$i]}
  if [ $i -lt $max_idx ] ; then
    echo "'${addr}',"
  else
    echo "'${addr}'"
  fi
done

for i in $(seq 0 $max_idx)
do
  priv=${KEYPAIRS_PRIV[$i]}
  if [ $i -lt $max_idx ] ; then
    echo "'${priv}',"
  else
    echo "'${priv}'"
  fi
done

# Generate ganache-cli --account options for user's to copy/paste
# ether unit is wei. Default here is set to 100 ETH.
for i in $(seq 0 $max_idx)
do
  priv=${KEYPAIRS_PRIV[$i]}
  echo "--account=\"0x${priv},100000000000000000000\" \\"
done

exit 0
