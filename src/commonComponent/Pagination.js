import Pagination from "react-js-pagination";

export const Commonpagination = ({ ActivePage, ItemsCountPerPage, TotalItemsCount, PageRangeDisplayed, Onchange }) => {
     return (
        <div>
            <Pagination
                activePage={ActivePage}
                itemsCountPerPage={ItemsCountPerPage}
                totalItemsCount={TotalItemsCount}            
                pageRangeDisplayed={PageRangeDisplayed}
                onChange={Onchange}
                itemClass="page-item"
                linkClass="page-link"
            />
        </div>
    )

}