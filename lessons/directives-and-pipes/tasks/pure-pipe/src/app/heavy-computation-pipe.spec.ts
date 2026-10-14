import { HeavyComputationPipe } from './heavy-computation-pipe';

describe('HeavyComputationPipe', () => {
  it('create an instance', () => {
    const pipe = new HeavyComputationPipe();
    expect(pipe).toBeTruthy();
  });
});
