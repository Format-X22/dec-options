import React, { useEffect, Dispatch, SetStateAction } from 'react';
import getOptions from '../helpers/getOptions';
import { OptionsData } from '@app/shared/options-data.schema';
import { Col, Row, Table, Layout, Select } from 'antd';
import format from 'date-fns/format';
import { Pagination } from '@app/shared/list.dto';
import { getOptionsParamsList, OptionsParamsList } from '../helpers/getOptionsParamsList';
import { BasicProps } from 'antd/lib/layout/layout';

type TColumnBinding = {
    title: string;
    dataIndex: string;
    key?: string;
    render?: (_: unknown, r: OptionsData) => string;
};
type TDataSource = OptionsData & { key: OptionsData['_id'] };
type TProps = {
    props: {
        options: Array<OptionsData>;
        initialPagination: Pagination;
        optionsParamsList: OptionsParamsList;
    };
};
type TSetter<T> = Dispatch<SetStateAction<T>>;

const { Content }: { Content: React.FC<BasicProps> } = Layout;
const columns: Array<TColumnBinding> = [
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
        render: (_: unknown, r: OptionsData): string => `${r.size} ${r.base}`,
    },
    {
        title: 'Strike',
        dataIndex: 'strike',
        render: (_: unknown, r: OptionsData): string => `${r.strike} ${r.quote}`,
    },
    {
        title: 'Expiration Date',
        dataIndex: 'expirationDate',
        key: 'expirationDate',
        render: (expirationDate: string): string => format(new Date(expirationDate), 'yyyy/MM/dd'),
    },
];

export type Filters = {
    filterByMarket?: string;
    filterByMarketType?: string;
    filterByType?: string;
};

const Home: ({
    options,
    initialPagination,
    optionsParamsList,
}: {
    options: Array<OptionsData>;
    initialPagination: Pagination;
    optionsParamsList: OptionsParamsList;
}) => JSX.Element = ({
    options = [],
    initialPagination,
    optionsParamsList,
}: {
    options: Array<OptionsData>;
    initialPagination: Pagination;
    optionsParamsList: OptionsParamsList;
}): JSX.Element => {
    const [optionsList, setOptionsList]: [Array<OptionsData>, TSetter<Array<OptionsData>>] = React.useState<
        Array<OptionsData>
    >(options);
    const [pagination, setPagination]: [Pagination, TSetter<Pagination>] = React.useState<Pagination>(
        initialPagination,
    );
    const [markets]: [OptionsParamsList['market'], TSetter<OptionsParamsList['market']>] = React.useState<string[]>(
        optionsParamsList.market,
    );
    const [filters, setFilters]: [Filters, TSetter<Filters>] = React.useState<Filters>({
        filterByMarket: '',
        filterByMarketType: '',
        filterByType: '',
    });

    async function requestData(): Promise<void> {
        try {
            const _filters: Filters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]: [string, string]): boolean => !!value),
            );
            const {
                data,
                pagination: incPagination,
            }: { data: OptionsData[]; pagination: Pagination } = await getOptions({
                limit: pagination.limit,
                offset: pagination.offset,
                ..._filters,
            });
            setOptionsList(data);
            setPagination(incPagination);
        } catch (error) {
            console.error(error);
        }
    }

    function onPaginationChange(page: number, pageSize: number = pagination.limit): void {
        setPagination({
            ...pagination,
            offset: (page - 1) * pageSize,
            limit: pageSize,
        });
    }

    function onChangeFilter(key: keyof Filters): (value: string) => void {
        return (value: string): void => {
            console.log(key);

            setFilters({
                ...filters,
                [key]: value,
            });
        };
    }

    useEffect((): void => {
        console.log(filters);

        requestData().catch();
    }, [pagination.offset, pagination.limit, filters]);

    const dataSource: Array<TDataSource> = optionsList.map(
        (optionsData: OptionsData): TDataSource => ({ ...optionsData, key: optionsData._id }),
    );

    return (
        <Layout>
            <Content>
                <Row gutter={[8, 8]} style={{ width: '100%', padding: 20 }}>
                    <Col span={6}>
                        <label>Market type</label>
                        <Select
                            onChange={onChangeFilter('filterByMarketType')}
                            value={filters.filterByMarketType}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value=''>All</Select.Option>
                            <Select.Option value='DEX'>DEX</Select.Option>
                            <Select.Option value='CEX'>CEX</Select.Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label>Market</label>
                        <Select
                            onChange={onChangeFilter('filterByMarket')}
                            value={filters.filterByMarket}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value=''>All</Select.Option>
                            {markets.map(
                                (market: string): JSX.Element => (
                                    <Select.Option value={market} key={market}>
                                        {market}
                                    </Select.Option>
                                ),
                            )}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <label>Option type</label>
                        <Select
                            onChange={onChangeFilter('filterByType')}
                            value={filters.filterByType}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value=''>All</Select.Option>
                            <Select.Option value='PUT'>PUT</Select.Option>
                            <Select.Option value='CALL'>CALL</Select.Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ width: '100%', padding: 20 }}>
                    <Col span={24}>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={{
                                pageSize: pagination.limit,
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

export async function getServerSideProps(): Promise<TProps> {
    const { data, pagination }: { data: OptionsData[]; pagination: Pagination } = await getOptions({
        offset: 0,
        limit: 20,
    });
    const optionsParamsList: OptionsParamsList = await getOptionsParamsList();

    return { props: { options: data, initialPagination: pagination, optionsParamsList } };
}

export default Home;
