import { MediaStatus, MediaType } from './enums';

export type Media = {
  id: number;
  status: MediaStatus;
  path: string;
  thumbnail: string;
  fileName: string;
  imageSize: string;
  fileSize: number;
  type: MediaType;
  extension: string;
  original: string;
  createdAt: Date;
  updatedAt: Date;
  caption: string;
  link: string;
  alt: string;
  page: number;
  focalX: number;
  focalY: number;
  width: number;
  height: number;
  ratio: number;
};
