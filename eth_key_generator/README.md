This repo provides a docker container to generate the keys for Ethereum.
You can tweak it to support other chains as well.

Reference: https://github.com/maandree/sha3sum.git
Reference: https://github.com/vkobel/ethereum-generate-wallet

To build the Docker image first before running,
```
./build.sh
```

To run it, (default generates 10 key pairs)
```
generate_keys.sh
```

The output is a bit complex, but if you pay attention, they are designed for you
to just `copy/paste` to `ganachi-cli` or `truffle-keys.js` for convinience.

e.g.
For `truffle-keys.js` so you can import them for your test case with predictable key-pairs.
You can also easily import these into `geth` as well or any other applications that need these.
First 10 rows are the `address` (Not PUBLIC KEY), the 11-20 rows are the real PRIVATE KEY.
```
'0x296253d432fa9389173d68978c284267609e5d26',
'0x6d56f8a138e9d8bb4bc95b7f5c2065dfeb5aa311',
'0xd27629fddf236ddcb26940090ef385c8b9873338',
'0x69b3bd833ff50d048ef48d8eccb2cd86216eb57a',
'0xcf599f964e1ac90c781fba7d4957f9b563186b36',
'0xd62ed833d26a025c1cc0fd6dc6f4661b4c102ea5',
'0x516f0bc387ba93c4099dc876b0e79f5a601f2b31',
'0x658d776c27b20d2cd99aeafe85b2aebe94be530b',
'0xf3ad9a0dac3a95c3b8da0d8cda3c8b897dab1fe5',
'0x3f909db61a03ccd9e89a1ffd07e2c8d4577ef6bb'
'92e2929bef6c5f87fb48d05b9ccd72798f2b26fe8e90a39d90feafb0e41cc1c7',
'af2c5e0c4bc57414e09d45c59773c5a121594b8063c01c7552fae731a99e2aa8',
'c1cb07d1844a33ab5778a094111844aa0ac64c6fe3769fa148b155f83e7f1c5c',
'22bf1f5453e32e77390f062f4c932c857d5458ddb0b5469c257145ab4cab3076',
'da112ef96ed568dbc09fee4d73e217c54c0fbc11f4d38aaf34af2b64fb66ccad',
'1f43bb3666790d0b6a28fe18d5f07efc75707c7ac804250cc7036a2850021363',
'45733e22b058056194bb19523752b304b62185775836f14ebf5623fc13944ffc',
'9ca195959f35e9b11d1b0d6b3e0c22830b26a80fc94a5d1aebcff504312e0d68',
'6d5769a4e666a539e89c0bf3202b1a5e4e5cc8628279d1b1739eedc65f862619',
'62d8f6460d73b9449708b01d1458e853fb5262df00d6e4c0420fd5b267be1600'
```

For `ganache-cli`,
```
--account="0x92e2929bef6c5f87fb48d05b9ccd72798f2b26fe8e90a39d90feafb0e41cc1c7,100000000000000000000" \
--account="0xaf2c5e0c4bc57414e09d45c59773c5a121594b8063c01c7552fae731a99e2aa8,100000000000000000000" \
--account="0xc1cb07d1844a33ab5778a094111844aa0ac64c6fe3769fa148b155f83e7f1c5c,100000000000000000000" \
--account="0x22bf1f5453e32e77390f062f4c932c857d5458ddb0b5469c257145ab4cab3076,100000000000000000000" \
--account="0xda112ef96ed568dbc09fee4d73e217c54c0fbc11f4d38aaf34af2b64fb66ccad,100000000000000000000" \
--account="0x1f43bb3666790d0b6a28fe18d5f07efc75707c7ac804250cc7036a2850021363,100000000000000000000" \
--account="0x45733e22b058056194bb19523752b304b62185775836f14ebf5623fc13944ffc,100000000000000000000" \
--account="0x9ca195959f35e9b11d1b0d6b3e0c22830b26a80fc94a5d1aebcff504312e0d68,100000000000000000000" \
--account="0x6d5769a4e666a539e89c0bf3202b1a5e4e5cc8628279d1b1739eedc65f862619,100000000000000000000" \
--account="0x62d8f6460d73b9449708b01d1458e853fb5262df00d6e4c0420fd5b267be1600,100000000000000000000" \
```
