import React from 'react';
import ReactDOM from 'react-dom';

// import update from 'react/lib/update';
import PropTypes from 'prop-types';

import Row from './row.jsx';
function buildArray(number = 0) {
  let _array = [];
  for (let index = 0; index < number; index++) {
    _array.push({});
  }
  return _array
}

class Datasheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: []
    }
    this.handleSeleteCell = this.handleSeleteCell.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }
  componentWillMount() {
    if (this.props.dataSource && Array.isArray(this.props.dataSource)) {
      let header = this.props.header;
      let dataSource = this.props.dataSource.map(item => {
        if (header.length > item.length) {
          return [].concat(item, buildArray(header.length - item.length))
        }
        return item;
      })
      this.setState({ dataSource });
    }
  }
  componentDidMount() {
    // const $datasheet = ReactDOM.findDOMNode(this);
    // const $parentNode = $datasheet.parentNode;
    // console.log('la', $parentNode.clientWidth)
  }
  handleSeleteCell(rIndex, index) {
    const dataSource = this.state.dataSource;
    const _dataSource = dataSource.map((item, idx) => {
      if (rIndex === idx) {
        return item.map((c, jdx) => ({
            ...c,
            editable: false,
            selected: jdx === index ? true : false
          })
        );
      }
      return item.map(c => ({...c, editable: false, selected: false }));
    })
    this.setState({ dataSource: _dataSource })
  }
  handleChange(rIndex, index, value) {
    let [rowData, cellData] = [null, null];
    const dataSource = this.state.dataSource.map((item, idx) => {
      if (idx === rIndex) {
        rowData = item.map((c, jdx) => {
          if (jdx === index) {
            cellData = {...c, value}
            return cellData;
          }
          return c;
        });
        return rowData;
      }
      return item;
    });
    this.setState({ dataSource }, () => {
      let row = rowData.map(item => {
        let { value, editable, selected, ...others} = item;
        return { value, ...others }
      });
      if (this.props.onChange && typeof this.props.onChange === 'function') {
        let { value, editable, selected, ...others} = cellData;
        this.props.onChange({ index, rowIndex: rIndex }, { value, ...others }, row)
      }
    })
  }
  handleKeyDown() {
    const dataSource = this.state.dataSource;
    const _dataSource = dataSource.map((item, idx) =>
      item.map(c => ({...c, editable: c.selected ? true : false }))
    )
    this.setState({ dataSource: _dataSource })
  }
  handleDoubleClick(rIndex, index) {
    const dataSource = this.state.dataSource.map((item, idx) => {
      if (idx === rIndex) {
        return item.map((c, jdx) => ({
          ...c,
          editable: jdx === index ? true : false
        }));
      }
      return item.map(c => ({...c, editable: false, selected: false }));
    })
    this.setState({ dataSource });
  }
  handleScroll(e) {
    const { scrollLeft, scrollTop, scrollHeight, clientHeight } = this.refs.datasheet;
    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(() => {
        console.log('aaa')
        this.refs.thead.style.transform = `translateY(${scrollTop}px)`;
         this.requestedFrame = null;
      });
    }
  }
  render() {
    const dataSource = this.state.dataSource;
    const header = this.props.header;
    const { xScroll } = this.props;
    let tStyle = null;
    if (xScroll) {
      tStyle={ width: xScroll };
    }
    return (
      <div
        className="dh-datasheet"
        ref="datasheet"
        onScroll={this.handleScroll}
        >
        <table
          tabIndex="-1"
          cellSpacing="0"
          onKeyDown={this.handleKeyDown}
          style={tStyle}
        >
          <thead ref="thead">
            <tr>
              {
                header.map((item, idx) => (
                  <th key={`datasheet-th-${idx}`}>{item.title}</th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {
              dataSource.map((item, idx) => (
                <Row
                  index={idx}
                  data={item}
                  key={`datasheet-row-${idx}`}
                  onChange={this.handleChange}
                  onDoubleClick={this.handleDoubleClick}
                  onEditable={this.handleEditable}
                  onSelectCell={this.handleSeleteCell}
                />
              ))
            }
          </tbody>
        </table>
      </div>
    )
  }
}
export default Datasheet
