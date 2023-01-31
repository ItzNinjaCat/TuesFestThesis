import { useEffect, useState, useContext } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { EVENT_AND_TICKETS_QUERY } from '../utils/subgraphQueries';
import { Button, Modal } from 'react-bootstrap';
import Loader from '../components/ui/Loader';
import { formatEther } from 'ethers/lib/utils';
import { Web3Context } from '../components/App';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
function EventDashboard() {
    const { id } = useParams();
    const [event, setEvent] = useState(undefined);
    const [ticketTypes, setTicketTypes] = useState(undefined);
    const [ticketSales, setTicketSales] = useState(undefined);
    const [show, setShow] = useState(false);
    const [chartData, setchartData] = useState([]);
    const [chartColors, setChartColors] = useState([]);
    const [dates, setDates] = useState([]);
    const [salesInfo, setSalesInfo] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [maxSupply, setMaxSupply] = useState(1);
    const navigate = useNavigate();
    const [acc, setAcc] = useState(undefined);
    const { contract, account } = useContext(Web3Context);
    const { loading, error, data } = useQuery(EVENT_AND_TICKETS_QUERY, {
        variables: {
            event: String(id)
        }
    });

    useEffect(() => {
        if (acc !== undefined && acc === account?.toLowerCase()) {
            return;
        }
        if (!loading) {
            try {
                if(data.event.creator !== account?.toLowerCase()){
                    navigate('/');
                }
                else {
                    setAcc(data.event.creator);
                }
            }catch(e){
                console.log(e);
                navigate('/');
            }
        }
    }, [loading, data, account]);

    useEffect(() => {
        if (!loading) {
            setTicketSales(data.tickets);
            let current = new Date(data.event.createdAt * 1000);
            current.setHours(0, 0, 0, 0);
            const end = new Date(data.event.startTime * 1000);
            end.setHours(0, 0, 0, 0);
            const tmpDates = [];
            const tmpChartData = [];
            while (current.getTime() <= end.getTime()) {
                tmpDates.push(new Date(current));
                tmpChartData.push({
                    name: current.getDate() + "." + (current.getMonth() + 1) + "." + current.getFullYear().toString().substr(-2)
                })
                current = new Date(current.setDate(current.getDate() + 1));
            }
            setDates(tmpDates);
            setchartData(tmpChartData);
            const tmpColors = [];
            let biggestSupply = 0;
            data.event.ticketTypes.forEach((ticketType) => {
                if (Number(ticketType.maxSupply) > biggestSupply) {
                    biggestSupply = Number(ticketType.maxSupply);
                }
                tmpColors.push("#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
            });
            setChartColors(tmpColors);
            setTicketTypes(data.event.ticketTypes);
            setMaxSupply(biggestSupply);
            setEvent(data.event);
        }
    }, [data, loading]);

    useEffect(() => {
        if (ticketTypes !== undefined && ticketSales !== undefined && dates?.length > 0) {
            const sales = [];
            let tmpTotalSales = 0;
            let tmpTotalProfit = 0;
            ticketTypes.forEach((ticketType) => {
                sales.push({
                    ticketType: ticketType.name,
                    sales: 0,
                    price: ticketType.price
                })
            });
            const tmpChartData = [...chartData];
            ticketTypes.forEach((ticketType) => {
                tmpChartData.forEach((data) => {
                    data[ticketType.name] = 0;
                });
                ticketSales.forEach((ticketSale) => {
                    if (ticketSale.ticketType.id === ticketType.id) {
                        dates.forEach((date) => {
                            const dateEnd = new Date(date);
                            dateEnd.setHours(24, 0, 0, 0);
                            const dateSale = new Date(ticketSale.timestamp * 1000);
                            if (dateSale.getTime() >= date.getTime() && dateSale.getTime() < dateEnd.getTime()) {
                                tmpChartData.forEach((data) => {
                                    if (data.name === date.getDate()  + "." + (date.getMonth()+1) + "." + date.getFullYear().toString().substr(-2)) {
                                        data[ticketType.name] += 1;
                                        tmpTotalSales += 1;
                                        tmpTotalProfit += Number(formatEther(ticketType.price));
                                        sales.forEach((sale) => {
                                            if (sale.ticketType === ticketType.name) {
                                                sale.sales += 1;
                                            }
                                        }
                                        );
                                    }
                                });
                            }
                        });
                    }
                });
            });
            setSalesInfo(sales);
            setchartData(tmpChartData);
            setTotalSales(tmpTotalSales);
            setTotalProfit(tmpTotalProfit);
        }
    }, [ticketSales, ticketTypes, dates]);

    const deleteEvent = () => {
        const deletableEvents =  event.ticketTypes.filter((ticketType) => ticketType.deleted === false);
        const promises = deletableEvents.map(async (ticketType) => {
            return (await contract.deleteTicketType(id, ticketType.id)).wait();
        });
        Promise.all(promises).then(() => {
            contract.deleteEvent(id);
        });
    };

    if (loading || event === undefined ) return <Loader />;
    if (error) return <p>Error: {error.message}</p>;
    return (
        <>
                <div className="d-flex mt-4 justify-content-around">
                    <div className="d-flex justify-content-center align-items-center flex-column">
                        <h1>{event.name}</h1>
                        <BarChart
                        width={800}
                        height={300}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} domain={[0, maxSupply]}/>
                            <Tooltip />
                            <Legend />
                            {
                                ticketTypes !== undefined && ticketTypes.map((ticketType, index) => {
                                    return <Bar key={ticketType.id} type="monotone" dataKey={ticketType.name} fill={chartColors[index]} />
                                })
                            }
                        </BarChart>
                    </div>
                        <div className="d-flex justify-content-center align-items-center flex-column me-10">
                            <h2>Sales Details</h2>
                        <div className="d-flex justify-content-center align-items-start flex-column">
                            <div>
                                <p>Total sales : {totalSales}</p>
                                <p>Total profit : {totalProfit}</p>
                            </div>
                                {salesInfo.map(sale => {
                                    return (
                                        <div key={sale.ticketType}>
                                            <p>{sale.ticketType} : {sale.sales}</p>
                                            <p>Profit: {Number(sale.sales * formatEther(sale.price))}</p>
                                        </div>
                                    )
                                })}
                        </div>
                    </div> 
                </div>
            <div className="d-flex justify-content-center align-items-center flex-column mt-4">
                <h2>Event details</h2>
                <div className="d-flex align-items-start flex-column">
                    <p>Start time: {new Date(event.startTime * 1000).toLocaleString()}</p>
                    {event.endTime * 1000 === 0 ? null : <p>End time: {new Date(event.endTime * 1000).toLocaleString()}</p>}
                    <p>Location: {event.location}</p>
                    <p>Organizer: {event.creator}</p>
                    <p>Event description: {event.description}</p>
                    <div className='d-flex justify-content-between w-100 mt-4'>
                        <Button onClick={() => navigate(`/events/${id}/edit`)}>Edit event details</Button>
                        <Button onClick={() => navigate(`/events/${id}/tickets/edit`)}>Edit ticket types</Button>
                        <Button variant="danger" onClick={() => setShow(true)}>Delete event</Button>
                    </div>
                </div>
            </div>
            <Modal
                show={show}
                onHide={() => setShow(false)}
                backdrop="static"
                centered
                keyboard={false}
            >
                <Modal.Header
                    closeButton
                >
                    <Modal.Title>Are you sure you want to permenantly delete this event?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='d-flex justify-content-between'>
                        <Button variant="danger" onClick={deleteEvent}> Yes </Button>
                        <Button variant="light" onClick={() => setShow(false)}> No </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default EventDashboard;