// import { useEffect, useState } from 'react';
import { LineChart } from '@mantine/charts';
import Card from '/resources/js/components/Card';

function OverViewProject() {
  //   const [data, setData] = useState({ planned: [], earned: [], actual: [] });

  //   useEffect(() => {
  //     const channel = echo.channel(`project.${projectId}`);
  //     channel.listen('EarnedValueUpdated', (data) => {
  //         setData(data); // Update your state with the new data
  //     });
  
  //     return () => {
  //         channel.stopListening('EarnedValueUpdated');
  //     };
  // }, []);
    return (
        <Card bg="none">
            <LineChart
                h={300}
                dataKey="date"
                series={[
                    // { name: "Planned Value", color: "indigo.6", data: data.planned },
                    // { name: "Earned Value", color: "blue.6", data: data.earned },
                    // { name: "Actual Cost", color: "red.6", data: data.actual },
                ]}
                curveType="linear" 
            />
        </Card>
    );
}
export default OverViewProject;
