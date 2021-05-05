import React, { useEffect } from 'react';
import { NextPage } from 'next';
import getOptions from '../helpers/getOptions';
import { OptionsData } from '@app/shared/options-data.schema';
import { Col, Row, Table, Layout, Select } from 'antd';
import format from 'date-fns/format';
import { Pagination } from '@app/shared/list.dto';
import { getOptionsParamsList, OptionsParamsList } from '../helpers/getOptionsParamsList';

const { Header, Footer, Sider, Content } = Layout;

const columns = [
    {
        title: 'Market Type',
        dataIndex: 'marketType',
        key: 'marketType',
    },
    {
        title: 'Market',
        dataIndex: 'market',
        key: 'market',
    },
    {
        title: 'Base',
        dataIndex: 'base',
        key: 'base',
    },
    {
        title: 'Quote',
        dataIndex: 'quote',
        key: 'quote',
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: 'Strike Asset',
        dataIndex: 'strikeAsset',
        key: 'strikeAsset',
    },
    {
        title: 'Size',
        dataIndex: 'size',
        // tslint:disable-next-line:typedef
        render: (_, r) => `${r.size} ${r.base}`,
    },
    {
        title: 'Strike',
        dataIndex: 'strike',
        // tslint:disable-next-line:typedef
        render: (_, r) => `${r.strike} ${r.quote}`,
    },
    {
        title: 'Expiration Date',
        dataIndex: 'expirationDate',
        key: 'expirationDate',
        // tslint:disable-next-line:typedef
        render: (expirationDate) => format(new Date(expirationDate), 'yyyy/MM/dd'),
    },
];

type Filters = {
    filterByMarket?: string;
    filterByMarketType?: string;
    filterByType?: string;
};

// tslint:disable-next-line:no-any
const Home: ({ options, initialPagination, optionsParamsList }: { options: any[]; initialPagination: Pagination, optionsParamsList: OptionsParamsList }) => JSX.Element = ({
    options = [],
    initialPagination,
    optionsParamsList,
}: {
    // tslint:disable-next-line:no-any
    options: any[];
    initialPagination: Pagination;
    optionsParamsList: OptionsParamsList;
}): JSX.Element => {
    // tslint:disable-next-line
    const [optionsList, setOptionsList] = React.useState<any[]>(options);
    const [pagination, setPagination] = React.useState<Pagination>(initialPagination);
    const [markets, setMarkets] = React.useState<string[]>(optionsParamsList.market);
    const [quotes, setQuotes] = React.useState<string[]>(optionsParamsList.quote);
    const [bases, setBases] = React.useState<string[]>(optionsParamsList.base);
    const [filters, setFilters] = React.useState<Filters>({
        filterByMarket: '',
        filterByMarketType: '',
        filterByType: '',
    });

    // tslint:disable-next-line:typedef
    const requestData = async () => {
        try {
            // tslint:disable-next-line:typedef
            const _filters: Filters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => !!value));
            // tslint:disable-next-line:no-shadowed-variable
            const {
                data,
                pagination: incPagination,
            }: { data: OptionsData[]; pagination: Pagination } = await getOptions({
                limit: `${pagination.limit}`,
                offset: `${pagination.offset - 1}`,
                ..._filters
            });
            setOptionsList(data);
            setPagination(incPagination);
        } catch (e) {
            console.log(e);
        }
    };

    // tslint:disable-next-line:typedef
    const onPaginationChange = (page: number, pageSize?: number) => {
        setPagination({
            ...pagination,
            offset: page,
            limit: pageSize || pagination.limit,
        });
    };

    // tslint:disable-next-line:typedef
    const onChangeFilter = (key: 'filterByMarket' | 'filterByMarketType' | 'filterByType') => (value: string) => {
        console.log(key);
        setFilters({
            ...filters,
            [key]: value,
        });
    };

    // tslint:disable-next-line:typedef
    useEffect(() => {
        console.log(filters);
        requestData();
    }, [pagination.offset, pagination.limit, filters]);

    // tslint:disable-next-line
    const dataSource = optionsList.map((o) => ({
        ...o,
        key: o._id,
    }));

    return (
        <Layout>
            <Content>
                <Row gutter={[8, 8]} style={{ width: '100%', padding: 8 }}>
                    <Col span={6}>
                        <label>Market type</label>
                        <Select
                            onChange={onChangeFilter('filterByMarketType')}
                            value={filters.filterByMarketType}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="">All</Select.Option>
                            <Select.Option value="DEX">DEX</Select.Option>
                            <Select.Option value="CEX">CEX</Select.Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label>Market</label>
                        <Select
                            onChange={onChangeFilter('filterByMarket')}
                            value={filters.filterByMarket}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="">All</Select.Option>
                            {markets.map((market: string) => (
                                <Select.Option value={market} key={market}>{market}</Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label>Option type</label>
                        <Select
                            onChange={onChangeFilter('filterByType')}
                            value={filters.filterByType}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="">All</Select.Option>
                            <Select.Option value="PUT">PUT</Select.Option>
                            <Select.Option value="CALL">CALL</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ width: '100%' }}>
                    <Col span={24}>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={{
                                pageSize: pagination.limit,
                                current: pagination.offset,
                                total: pagination.total,
                                showSizeChanger: true,
                                onChange: onPaginationChange,
                            }}
                        />
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

// tslint:disable-next-line:typedef
export const getServerSideProps = async () => {
    const { data, pagination }: { data: OptionsData[]; pagination: Pagination } = await getOptions({ offset: '0' });
    const optionsParamsList: OptionsParamsList = await getOptionsParamsList();

    return { props: { options: data, initialPagination: pagination, optionsParamsList } };
};

export default Home;
