import { DeviceBasic } from './device'
import { DeviceLocation } from './location'
import { PersonInfo } from './person'

export type DevicePosition = DeviceBasic & DeviceLocation & Partial<PersonInfo>