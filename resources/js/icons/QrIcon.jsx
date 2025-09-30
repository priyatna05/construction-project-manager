export default function QrIcon(props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ width: '1rem', height: '1rem' }}
      {...props}
    >
      <rect
        x='3'
        y='3'
        width='5'
        height='5'
        rx='1'
      />
      <rect
        x='16'
        y='3'
        width='5'
        height='5'
        rx='1'
      />
      <rect
        x='3'
        y='16'
        width='5'
        height='5'
        rx='1'
      />

      <path d='M10 3h1v1h-1zM13 3h1v1h-1zM10 6h1v1h-1zM13 6h1v1h-1zM10 9h4v1h-4z' />
      <path d='M16 10h1v1h-1zM19 10h1v1h-1zM16 13h4v1h-4z' />
      <path d='M10 13h1v1h-1zM13 13h1v1h-1zM10 16h1v1h-1zM13 16h1v1h-1zM13 19h1v1h-1zM16 19h4v1h-4z' />
    </svg>
  );
}
