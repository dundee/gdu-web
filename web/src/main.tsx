import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Pie} from 'react-chartjs-2';
import {Chart} from 'chart.js';
import {Tableau20} from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau';

const DONE = "done";
const SCANNING = "scanning";

function formatSize(size: number): string {
    let round = (x: number, y: number) => Math.round(x / Math.pow(2, y) * 10) / 10

    if (size > 1e12) {
        return `${round(size, 40)} TiB`;
    } else if (size > 1e9) {
        return `${round(size, 30)} GiB`;
    } else if (size > 1e9) {
        return `${round(size, 20)} MiB`;
    } else if (size > 1e9) {
        return `${round(size, 10)} KiB`;
    } else {
        return `${size} B`;
    }
}

function connectWs(dataReceivedCallback: Function) {
    let ws = new WebSocket('ws://localhost:8888/ws');

    ws.addEventListener('open', function (event) {
        console.log("open");
    });
    ws.addEventListener('error', function (event) {
        console.log("error");
        ws.close();
    });
    ws.addEventListener('close', function (event) {
        dataReceivedCallback({msgType: "close"});
        setTimeout(() => connectWs(dataReceivedCallback), 1000);
    });

    ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        dataReceivedCallback(data);
    });
}

interface AppProps {}

interface Item {
    name: string
    size: number
}

interface AppState {
    status: string
    itemCount: number
    totalSize: number
    path: string
    items: Item[]
}

interface DataRecord {
    msgType: string
    done: boolean
    itemCount: number
    totalSize: number
    path: string
    items: Item[]
}

class App extends React.Component<AppProps, AppState> {
    chart: React.RefObject<any>;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            status: null,
            itemCount: 0,
            totalSize: 0,
            path: "",
            items: [],
        };
        this.chart = React.createRef();
        this.onMessage = this.onMessage.bind(this);
    }

    onMessage(data: DataRecord) {
        if (data.msgType === "progress") {
            const status = this.state.status;

            if (data.done === false && status !== SCANNING) {
                this.setState({status: SCANNING});
            }
            if (data.done === true && status !== DONE) {
                this.setState({status: DONE});
            }

            this.setState({
                itemCount: data.itemCount,
                totalSize: data.totalSize,
            });
        } else if (data.msgType === "dir") {
            console.log(data);
            this.setState({path: data.path, items: data.items})
        }

    }


    componentDidMount() {
        connectWs(this.onMessage);
    }

    renderStatus() {
        if (![SCANNING, DONE].includes(this.state.status)) {
            return "";
        }

        if (this.state.status === SCANNING) {
            return <span className="green">"Scanning..."</span>;
        }
        if (this.state.status === DONE) {
            return <span className="green">"Done"</span>;
        }
    }

    renderProgress() {
        if (this.state.status !== SCANNING) {
            return "";
        }

        return (
            <div id="progress">
                <span className="center">
                    Total items: <span className="red">{this.state.itemCount}</span><br />
                    Size: <span className="red">{formatSize(this.state.totalSize)}</span>
                </span>
            </div>
        );
    }

    renderPie() {
        if (this.state.status !== DONE) {
            return "";
        }

        let labels = [];
        let values = [];

        for (let item of this.state.items) {
            labels.push(item.name);
            values.push(item.size);
        }

        return (
            <Pie
                ref={this.chart}
                width={500}
                data={{
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: Tableau20,
                    }],
                }}
                legend={{
                    position: "chartArea"
                }}
                options={{
                    events: ["click"],
                    onClick: (e) => {
                        let index = this.chart.current.chartInstance.active[0]._index;
                        console.log(this.state.items[index].name);
                     }
                }}
            />
        );

    }

    render() {
        return (
            <div>
                <h1>go DiskUsage({this.renderStatus()})</h1>
                {this.renderProgress()}
                {this.renderPie()}
            </div>
        );
    }
}

const domContainer = document.querySelector('#container');
ReactDOM.render(<App />, domContainer);