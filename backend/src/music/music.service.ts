import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MusicService {
  constructor(private prisma: PrismaService) {}

  async getTracks(locationId: string) {
    return this.prisma.musicTrack.findMany({
      where: { locationId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  async getAllTracks(locationId: string) {
    return this.prisma.musicTrack.findMany({
      where: { locationId },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  async createTrack(
    locationId: string,
    data: {
      title: string;
      artist?: string;
      url: string;
      duration?: number;
      category?: string;
      isDefault?: boolean;
    },
  ) {
    // If setting as default, unset existing default
    if (data.isDefault) {
      await this.prisma.musicTrack.updateMany({
        where: { locationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const lastTrack = await this.prisma.musicTrack.findFirst({
      where: { locationId },
      orderBy: { sortOrder: 'desc' },
    });

    return this.prisma.musicTrack.create({
      data: {
        locationId,
        title: data.title,
        artist: data.artist,
        url: data.url,
        duration: data.duration,
        category: data.category || 'general',
        isDefault: data.isDefault || false,
        sortOrder: (lastTrack?.sortOrder || 0) + 1,
      },
    });
  }

  async updateTrack(
    trackId: string,
    data: {
      title?: string;
      artist?: string;
      url?: string;
      duration?: number;
      category?: string;
      isDefault?: boolean;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    const track = await this.prisma.musicTrack.findUnique({
      where: { id: trackId },
    });
    if (!track) throw new NotFoundException('Track not found');

    // If setting as default, unset existing default
    if (data.isDefault) {
      await this.prisma.musicTrack.updateMany({
        where: { locationId: track.locationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.musicTrack.update({
      where: { id: trackId },
      data,
    });
  }

  async deleteTrack(trackId: string) {
    return this.prisma.musicTrack.update({
      where: { id: trackId },
      data: { isActive: false },
    });
  }

  async getDefaultTrack(locationId: string) {
    return this.prisma.musicTrack.findFirst({
      where: { locationId, isDefault: true, isActive: true },
    });
  }

  async setDefaultTrack(locationId: string, trackId: string) {
    await this.prisma.musicTrack.updateMany({
      where: { locationId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.musicTrack.update({
      where: { id: trackId },
      data: { isDefault: true },
    });
  }
}
