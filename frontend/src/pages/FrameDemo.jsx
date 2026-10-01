import SceneReel from '../components/SceneReel'

const scene1Frames = Array.from(
  { length: 61 },
  (_, i) => `/house-frames-real/frame_${String(i + 1).padStart(3, '0')}.webp`
)
const scene2Frames = Array.from(
  { length: 49 },
  (_, i) => `/entrance-frames-real/frame_${String(i + 1).padStart(3, '0')}.webp`
)
const scene3Frames = Array.from(
  { length: 49 },
  (_, i) => `/interior-frames-real/frame_${String(i + 1).padStart(3, '0')}.webp`
)
const scene4Frames = Array.from(
  { length: 61 },
  (_, i) => `/room2-frames-real/frame_${String(i + 1).padStart(3, '0')}.webp`
)
const scene5Frames = Array.from(
  { length: 73 },
  (_, i) => `/closing-frames-real/frame_${String(i + 1).padStart(3, '0')}.webp`
)

const scenes = [
  {
    frames: scene1Frames,
    captions: [
      { at: 0.0, title: 'Exploded View', subtitle: 'Every layer of the build, separated.' },
      { at: 0.35, title: 'Taking Shape', subtitle: 'Structure, envelope, and finish align.' },
      { at: 0.75, title: 'Completed', subtitle: 'Ready to hand over to the client.' },
    ],
  },
  {
    frames: scene2Frames,
    captions: [
      { at: 0.0, title: 'Scene 02', subtitle: 'Approaching the entrance.' },
      { at: 0.6, title: 'Scene 02', subtitle: 'Every detail, considered.' },
    ],
  },
  {
    frames: scene3Frames,
    captions: [
      { at: 0.0, title: 'Scene 03', subtitle: 'Stepping inside.' },
      { at: 0.6, title: 'Scene 03', subtitle: 'Living spaces, made for daily life.' },
    ],
  },
  {
    frames: scene4Frames,
    captions: [
      { at: 0.0, title: 'Scene 04', subtitle: 'Through to the dining area.' },
      { at: 0.6, title: 'Scene 04', subtitle: 'Every room, considered together.' },
    ],
  },
  {
    frames: scene5Frames,
    captions: [
      { at: 0.0, title: 'Scene 05', subtitle: 'A final walk through the lobby.' },
      { at: 0.6, title: 'Scene 05', subtitle: 'The finished space, ready to welcome.' },
    ],
  },
]

export default function FrameDemo() {
  return <SceneReel scenes={scenes} fit="contain" />
}