import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { wirefluidTestnet } from './wagmi'

export const config = getDefaultConfig({
  appName: 'WirePayments',
  projectId: '3fbb6b1c77508920958f0019A8678077',
  chains: [wirefluidTestnet],
  ssr: true,
})
