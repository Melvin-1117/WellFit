import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";

function Services() {
  return (
    <section className="services">

      <div className="service">
        <div className="service-icon">
          <LocalShippingOutlinedIcon style={{ fontSize: 28 }} />
        </div>
        <h3>Free Shipping</h3>
        <p>Free shipping on all orders.</p>
      </div>

      <div className="service">
        <div className="service-icon">
          <SupportAgentOutlinedIcon style={{ fontSize: 28 }} />
        </div>
        <h3>Support 24/7</h3>
        <p>Our support team is available anytime.</p>
      </div>

      <div className="service">
        <div className="service-icon">
          <CurrencyExchangeOutlinedIcon style={{ fontSize: 28 }} />
        </div>
        <h3>Money Return</h3>
        <p>Easy returns and hassle-free refunds.</p>
      </div>

    </section>
  );
}

export default Services;