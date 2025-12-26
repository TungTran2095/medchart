# **App Name**: Supabase Visualizer

## Core Features:

- Data Fetching: Fetch data from the Supabase database using the provided URL and API key: NEXT_PUBLIC_SUPABASE_URL=https://yofbdpzapeismxrcrfml.supabase.co and NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZmJkcHphcGVpc214cmNyZm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDU3MDUsImV4cCI6MjA3MTY4MTcwNX0.BUKWzsuGR8ktzz9zvy7YTVRR2OV3dZRlHyfAxHcN2ag.
- Chart Generation: Generate charts based on the fetched data. Support line, bar, and pie charts.
- Dashboard Layout: Display charts in a user-friendly dashboard layout.
- Data Table View: Allow users to view the raw data in a tabular format.
- Dynamic Chart Configuration: Enable users to select the database table and columns for visualization, updating charts accordingly. The AI tool will use reasoning to map columns to different chart axes. If the column datatypes are not suitable, the tool will report that information to the user.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to reflect data analysis and stability.
- Background color: Light gray (#F0F2F5) for a clean and professional look.
- Accent color: Teal (#009688) for interactive elements and highlights, offering a visual contrast.
- Body and headline font: 'Inter' sans-serif font for clear readability and a modern feel.
- Use simple, outlined icons for navigation and chart options.
- Use a responsive grid layout to adapt to different screen sizes.
- Subtle transitions when loading data and updating charts.