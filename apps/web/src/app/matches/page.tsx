'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

// Mock data
const mockMatches = [
  {
    id: 1,
    matchId: 'val_001',
    date: new Date(2024, 0, 20, 14, 30),
    map: 'Ascent',
    mode: 'Competitive',
    agent: 'Jett',
    rank: 'Diamond 2',
    rr: '+18',
    result: 'W',
    score: '13-11',
    kills: 22,
    deaths: 15,
    assists: 4,
    kd: 1.47,
    hs: 35,
    adr: 156,
    combatScore: 280,
  },
  {
    id: 2,
    matchId: 'val_002',
    date: new Date(2024, 0, 20, 13, 15),
    map: 'Haven',
    mode: 'Competitive',
    agent: 'Reyna',
    rank: 'Diamond 2',
    rr: '-12',
    result: 'L',
    score: '10-13',
    kills: 18,
    deaths: 20,
    assists: 2,
    kd: 0.9,
    hs: 22,
    adr: 132,
    combatScore: 210,
  },
  {
    id: 3,
    matchId: 'val_003',
    date: new Date(2024, 0, 19, 20, 0),
    map: 'Split',
    mode: 'Competitive',
    agent: 'Jett',
    rank: 'Diamond 2',
    rr: '+25',
    result: 'W',
    score: '13-7',
    kills: 28,
    deaths: 13,
    assists: 6,
    kd: 2.15,
    hs: 42,
    adr: 189,
    combatScore: 340,
  },
  {
    id: 4,
    matchId: 'val_004',
    date: new Date(2024, 0, 19, 18, 45),
    map: 'Bind',
    mode: 'Competitive',
    agent: 'Raze',
    rank: 'Diamond 1',
    rr: '+14',
    result: 'W',
    score: '13-9',
    kills: 20,
    deaths: 16,
    assists: 8,
    kd: 1.25,
    hs: 28,
    adr: 145,
    combatScore: 265,
  },
  {
    id: 5,
    matchId: 'val_005',
    date: new Date(2024, 0, 18, 22, 30),
    map: 'Icebox',
    mode: 'Competitive',
    agent: 'Jett',
    rank: 'Diamond 1',
    rr: '-16',
    result: 'L',
    score: '11-13',
    kills: 15,
    deaths: 19,
    assists: 3,
    kd: 0.79,
    hs: 20,
    adr: 118,
    combatScore: 195,
  },
];

const agents = [
  'All Agents',
  'Jett',
  'Reyna',
  'Raze',
  'Phoenix',
  'Sage',
  'Sova',
  'Cypher',
];
const maps = [
  'All Maps',
  'Ascent',
  'Bind',
  'Haven',
  'Split',
  'Icebox',
  'Breeze',
  'Fracture',
  'Pearl',
  'Lotus',
];
const modes = [
  'All Modes',
  'Competitive',
  'Unrated',
  'Spike Rush',
  'Deathmatch',
];

export default function MatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('All Agents');
  const [selectedMap, setSelectedMap] = useState('All Maps');
  const [selectedMode, setSelectedMode] = useState('All Modes');
  const [dateRange, setDateRange] = useState('7d');

  const filteredMatches = mockMatches.filter((match) => {
    if (selectedAgent !== 'All Agents' && match.agent !== selectedAgent)
      return false;
    if (selectedMap !== 'All Maps' && match.map !== selectedMap) return false;
    if (selectedMode !== 'All Modes' && match.mode !== selectedMode)
      return false;
    if (
      searchQuery &&
      !match.map.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getResultColor = (result: string) => {
    return result === 'W' ? 'text-green-500' : 'text-red-500';
  };

  const getRRColor = (rr: string) => {
    return rr.startsWith('+') ? 'text-green-500' : 'text-red-500';
  };

  const getKDColor = (kd: number) => {
    if (kd >= 1.5) return 'text-green-500';
    if (kd >= 1.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Layout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold'>Match History</h1>
          <p className='text-muted-foreground'>
            Track your performance across all your VALORANT matches.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4'>
              <div className='flex-1 min-w-[200px]'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search matches...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9'
                  />
                </div>
              </div>

              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMap} onValueChange={setSelectedMap}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maps.map((map) => (
                    <SelectItem key={map} value={map}>
                      {map}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className='w-[150px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='24h'>Last 24 Hours</SelectItem>
                  <SelectItem value='7d'>Last 7 Days</SelectItem>
                  <SelectItem value='30d'>Last 30 Days</SelectItem>
                  <SelectItem value='all'>All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Match List */}
        <div className='space-y-4'>
          {filteredMatches.map((match) => (
            <Card key={match.id} className='overflow-hidden'>
              <div className='flex items-center'>
                {/* Result Indicator */}
                <div
                  className={`w-2 h-full ${match.result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}
                />

                {/* Match Content */}
                <div className='flex-1 p-6'>
                  <div className='flex items-center justify-between'>
                    {/* Left Section */}
                    <div className='flex items-center gap-6'>
                      {/* Map & Mode */}
                      <div>
                        <div className='text-lg font-semibold'>{match.map}</div>
                        <div className='text-sm text-muted-foreground'>
                          {match.mode}
                        </div>
                      </div>

                      {/* Agent */}
                      <div className='text-center'>
                        <div className='text-sm text-muted-foreground'>
                          Agent
                        </div>
                        <div className='font-medium'>{match.agent}</div>
                      </div>

                      {/* Score */}
                      <div className='text-center'>
                        <div
                          className={`text-2xl font-bold ${getResultColor(match.result)}`}
                        >
                          {match.score}
                        </div>
                      </div>

                      {/* Rank & RR */}
                      <div className='text-center'>
                        <div className='font-medium'>{match.rank}</div>
                        <div
                          className={`text-sm font-semibold ${getRRColor(match.rr)}`}
                        >
                          {match.rr} RR
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className='flex items-center gap-8'>
                      {/* K/D/A */}
                      <div className='text-center'>
                        <div className='text-sm text-muted-foreground'>
                          K/D/A
                        </div>
                        <div className='font-medium'>
                          {match.kills}/{match.deaths}/{match.assists}
                        </div>
                        <div className={`text-sm ${getKDColor(match.kd)}`}>
                          {match.kd} K/D
                        </div>
                      </div>

                      {/* Stats */}
                      <div className='grid grid-cols-3 gap-4 text-center'>
                        <div>
                          <div className='text-sm text-muted-foreground'>
                            HS%
                          </div>
                          <div className='font-medium'>{match.hs}%</div>
                        </div>
                        <div>
                          <div className='text-sm text-muted-foreground'>
                            ADR
                          </div>
                          <div className='font-medium'>{match.adr}</div>
                        </div>
                        <div>
                          <div className='text-sm text-muted-foreground'>
                            ACS
                          </div>
                          <div className='font-medium'>{match.combatScore}</div>
                        </div>
                      </div>

                      {/* Time */}
                      <div className='text-right'>
                        <div className='text-sm font-medium'>
                          {format(match.date, 'MMM d, yyyy')}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {format(match.date, 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className='flex justify-center'>
          <Button variant='outline'>Load More Matches</Button>
        </div>
      </div>
    </Layout>
  );
}
